"""
Wanderson Soares dos Santos - UTF-8 - 11-04-2023
Module responsible for the return of pages and the treatment
of the data from the users
"""
import json
import os
import re
from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import func
from pytube import YouTube, Playlist
from .models import Audio, Personal_playlist, Singer
from . import db



views = Blueprint('views', __name__)

@views.route('/', methods=['GET', 'POST'])
@login_required
def all_songs():
    """function responsible for the main page of the website"""
    return render_template('view_songs.html',
                           user=current_user,
                           playlist_title='Todas as músicas',
                           songs_list=current_user.audios)




@views.route('/playlists', methods=['GET', 'POST'])
@login_required
def playlists():    
    '''
    db.session.delete(current_user.playlists[1])
    db.session.commit()
    '''
        
    """function responsible for the playlists collection page of the website"""        
    return render_template('playlists.html', user=current_user)

@views.route('playlists/<playlist_title>', methods=['GET', 'POST'])
@login_required
def playlists_songs(playlist_title):
    """function responsible for the individual page of the playlists"""
    current_playlist = Personal_playlist.query.filter_by(titulo=playlist_title).first()
    if current_playlist is None:
        return render_template('404.html'), 404

    return render_template('view_songs.html',
                           user=current_user,
                           playlist_title = playlist_title,
                           playlist_id = current_playlist.id,
                           songs_list=current_playlist.audios)

@views.route('/cantores', methods=['GET', 'POST'])
@login_required
def singers():
    """function responsible for the singers collection page of the website"""
    return render_template('singers.html', user=current_user)

@views.route('cantores/<singer_title>', methods=['GET', 'POST'])
@login_required
def view_singers(singer_title):
    """function responsible for the individual page of the singers"""
    current_singer = Singer.query.filter_by(name=singer_title).first()
    if current_singer is None:
        return render_template('404.html'), 404

    return render_template('view_songs.html',
                           user=current_user,
                           playlist_title = singer_title,
                           songs_list=current_singer.audios)


@views.route('/delete-music', methods=['DELETE'])
@login_required
def delete_audio():
    """function responsible for delete the audios from the website"""
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
@login_required
def add_playlist():
    """function responsible for add the playlists in the website"""
    playlist_data = json.loads(request.data)
    if 'url' in playlist_data:
        playlist_youtube = Playlist(playlist_data['url'])
        playlist_title = playlist_youtube.title
    else:
        playlist_title = playlist_data['playlistTitle']
    playlist = Personal_playlist.query.filter_by(titulo=func.lower(playlist_title)).first()
    if playlist is None:
        new_playlist = Personal_playlist(titulo=playlist_title, user_id=current_user.id)
        db.session.add(new_playlist)
        db.session.commit()

    if 'url' in playlist_data:
        urls = playlist_youtube.video_urls
        return jsonify({ "urls" : list(urls)})



    return jsonify({})













@views.route('/add-music', methods=['POST'])
@login_required
def add_music():
    """function responsible for add the audios in the website"""
    music_request = json.loads(request.data)
    url = music_request['music_url']
    yt = YouTube(url)
    music = Audio.query.filter_by(video_id=yt.video_id).first()
    if music is None:
        try_again = True
        atempt = 0
        while try_again:
            try:
                audio = yt.streams.get_by_itag(140)
                tamanho_em_bytes = audio.filesize_approx

                if (tamanho_em_bytes/ 1000000) > 10:
                    return jsonify({}), 413

                filename = f'{(audio.title).replace(" ","_")}.mp3'

                filename = re.sub(r'[^\w\-_.]', '', filename)

                if os.path.exists(f'./website/static/users/{str(current_user.id)}/songs/{filename}'):
                    filename = f'{filename}1'

                audio.download(output_path=(f'./website/static/users/{str(current_user.id)}/songs/')
                               ,filename=filename)

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


                cantor = cantor.replace('&',',').split(',')

                for i in cantor:
                    i = i.strip()
                    if bool(i):
                        current_singer = Singer.query.filter_by(name=i).first()
                        if current_singer is None:
                            current_singer = Singer(user_id=current_user.id,
                                                    name=i)
                            db.session.add(current_singer)
                        current_singer.audios.append(new_audio)

                if music_request['playlist'] == 'YES':
                    current_playlist = Personal_playlist.query.order_by(Personal_playlist.id.desc()).first()
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


@views.route('/edit-music', methods=['PUT'])
@login_required
def edit_music():
    """function responsible for editing the music data in the website"""
    music_request = json.loads(request.data)
    audio = db.session.query(Audio).filter_by(id=music_request['musicId']).first()
    audio.title = music_request['musicName']
    audio.author = music_request['singerName']

    db.session.commit()
    return ['Música Editada']

@views.errorhandler(404)
def page_not_found():
    """function that returns the 404 page error"""
    return render_template('404.html'), 404



@views.route('/update_list_songs_playlist', methods=['PUT'])
@login_required
def edit_list_playlist():
    data = json.loads(request.data)
    list_request = data[0]

    current_playlist = Personal_playlist.query.filter_by(id=data[1]).first()

    for audios_id in list_request:
        audio = Audio.query.filter_by(id=int(audios_id)).first()
        current_playlist.audios.append(audio)

    db.session.commit()

    return ['Playlist Editada']


@views.route("/edit-playlist-title", methods=['PUT'])
@login_required
def edit_playlist_title():
    playlist_id = json.loads(request.data)
    print(playlist_id)

    return ('Nome editado')
