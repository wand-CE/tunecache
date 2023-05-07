import json
import os
import re
from flask import Blueprint, render_template, request, flash, jsonify
from flask_login import login_required, current_user
from .pytube import YouTube, Playlist
from .models import Audio, Playlist_personal, Singer
from . import db



views = Blueprint('views', __name__)

@views.route('/', methods=['GET', 'POST'])
@login_required
def all_songs():
    return render_template('view_songs.html',
                           user=current_user,
                           playlist_title='Todas as músicas',
                           songs_list=current_user.audios)




@views.route('/playlists', methods=['GET', 'POST'])
@login_required
def playlists():
    return render_template('playlists.html', user=current_user)

@views.route('playlists/<playlist_title>', methods=['GET', 'POST'])
@login_required
def view_songs(playlist_title):
    current_playlist = Playlist_personal.query.filter_by(titulo=playlist_title).first()
    if current_playlist is None:
        return render_template('404.html'), 404

    return render_template('view_songs.html',
                           user=current_user,
                           playlist_title = playlist_title,
                           songs_list=current_playlist.audios)

@views.route('/cantores', methods=['GET', 'POST'])
@login_required
def singers():
    return render_template('singers.html', user=current_user)

@views.route('cantores/<singer_title>', methods=['GET', 'POST'])
@login_required
def view_singers(singer_title):
    current_singer = Singer.query.filter_by(name=singer_title).first()
    if current_singer is None:
        return render_template('404.html'), 404

    return render_template('view_songs.html',
                           user=current_user,
                           playlist_title = singer_title,
                           songs_list=current_singer.audios)


@views.route('/delete-audio', methods=['POST'])
def delete_audio():
    audio = json.loads(request.data)
    audioId = audio['audioId']
    audio = Audio.query.get(audioId)
    if audio:
        if audio.user_id == current_user.id:
            db.session.delete(audio)

            os.remove(f"./website/static/users/{audio.user_id}/songs/{audio.nome_na_pasta}")
            db.session.commit()
    return jsonify({})







@views.route('/add-playlist', methods=['POST'])
def add_playlist():
    playlist_data = json.loads(request.data)
    if 'url' in playlist_data:
        playlist_youtube = Playlist(playlist_data['url'])
        playlist_title = playlist_youtube.title
    else:
        playlist_title = playlist_data['playlistTitle']
    playlist = Playlist_personal.query.filter_by(titulo=playlist_title).first()
    if playlist is None:
        new_playlist = Playlist_personal(titulo=playlist_title, user_id=current_user.id)
        db.session.add(new_playlist)
        db.session.commit()

    if 'url' in playlist_data:
        urls = playlist_youtube.video_urls
        return jsonify({ "urls" : list(urls)})



    return jsonify({})













@views.route('/add-music', methods=['POST'])
def add_music():
    music_request = json.loads(request.data)
    url = music_request['music_url']
    yt = YouTube(url)
    music = Audio.query.filter_by(video_id=yt.video_id).first()
    if music is None:
        try_again = True
        atempt = 0
        while try_again:
            try:
                audio = yt.streams.get_audio_only()
                filename = f'{(audio.title).replace(" ","_")}.mp3'
                
                filename = re.sub(r'[^\w\-_.]', '', filename)

                audio.download(output_path=(f'./website/static/users/{str(current_user.id)}/songs/').replace(" ", "_"),
                                filename=filename)


                titulo = music_request['titulo']

                cantor = music_request['cantor']

                if len(titulo.strip()) == 0:
                    titulo = audio.title
                if len(cantor.strip()) == 0:
                    cantor = yt.author

                new_audio = Audio(user_id=current_user.id,
                                  video_id=yt.video_id,
                                  title=titulo,
                                  nome_na_pasta=filename,
                                  author=cantor,
                                  thumb=yt.thumbnail_url)
                db.session.add(new_audio)

                current_singer = Singer.query.filter_by(name=cantor).first()
                if current_singer is None:
                    current_singer = Singer(user_id=current_user.id,
                                            name=cantor)
                    db.session.add(current_singer)                    
                    
                current_singer.audios.append(new_audio)
                    
                if music_request['playlist'] == 'YES':
                    current_playlist = Playlist_personal.query.order_by(Playlist_personal.id.desc()).first()
                    current_playlist.audios.append(new_audio)

                db.session.commit()

                audio = current_user.audios[-1]

                return jsonify({
                    "id" : audio.id,
                    "author" : audio.author,
                    "title" : audio.title,
                    "nome_na_pasta" : audio.nome_na_pasta,
                    "user_id" : audio.user_id,
                    "thumb": audio.thumb,
                    })
            except:
                atempt += 1
                if atempt == 200:                        
                    try_again = False
                    return jsonify({}), 500

    return jsonify({'added_before': 'YES'})





@views.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404
