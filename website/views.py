import json
import os
from flask import Blueprint, render_template, request, flash, jsonify
from flask_login import login_required, current_user
from pytube import YouTube
from .models import Audio, Playlist
from . import db



views = Blueprint('views', __name__)

@views.route('/')
@login_required
def home():
    return render_template('home.html', user=current_user)

@views.route('/allsongs', methods=['GET', 'POST'])
@login_required
def all_songs():
    if request.method == 'POST':
        titulo = request.form.get('titulo')
        video = request.form.get('url')
        autor = request.form.get('autor')

        if len(video) < 1:
            flash('URL pequena demais!', category='error')
        else:
            yt = YouTube(str(video))
            thumb = yt.thumbnail_url
            if len(autor) == 0:
                autor = yt.author
            if len(titulo) == 0:
                titulo = yt.title
            for song in current_user.audios:
                if titulo == song.title:
                    flash('Música já adicionada!', category='error')
                    return render_template('home.html', user=current_user)


            print('URL', video)
            # audio = yt.streams.filter(only_audio=True).first()
            try_again = True
            while try_again:
                try:
                    audio = yt.streams.first()
                    try_again=False
                except:
                    pass

            download_audio = audio.download(output_path=(f'./website/static/users/{str(current_user.id)}/songs/').replace(" ", "_"))
            base, ext = os.path.splitext(download_audio)

            video_to_audio = base + '.mp3'
            video_to_audio = video_to_audio.replace(" ", "_")
            try:
                os.rename(download_audio, video_to_audio)
            except FileExistsError:
                os.remove(download_audio)
                flash('Música já adicionada!', category='error')
                return render_template('home.html', user=current_user)
            print(titulo)

            nome_mp3_pasta =  video_to_audio.split('songs/')
            nome_mp3_pasta = str(nome_mp3_pasta[1])
            new_audio = Audio(user_id=current_user.id, title=titulo,
                    nome_na_pasta=nome_mp3_pasta, author=autor,
                    thumb=thumb)
            print(new_audio)
            db.session.add(new_audio)
            db.session.commit()
            flash('Música Adicionada!', category='success')
    return render_template('view_songs.html',
                           user=current_user,
                           playlist_title='Todas as músicas',
                           songs_list=current_user.audios)


@views.route('playlists/<playlist_title>', methods=['GET', 'POST'])
@login_required
def view_songs(playlist_title):
    current_playlist = Playlist.query.filter_by(titulo=playlist_title).first()
    if current_playlist is None:
        return render_template('404.html'), 404
    elif request.method == 'POST':        
        titulo = request.form.get('titulo')
        video = request.form.get('url')
        autor = request.form.get('autor')

        if len(video) < 1:
            flash('URL pequena demais!', category='error')
        else:
            yt = YouTube(str(video))
            thumb = yt.thumbnail_url
            if len(autor) == 0:
                autor = yt.author
            if len(titulo) == 0:
                titulo = yt.title
            for song in current_user.audios:
                if titulo == song.title:
                    flash('Música já adicionada!', category='error')
                    return render_template('home.html', user=current_user)
                        
            try_again = True
            while try_again:
                try:
                    audio = yt.streams.first()
                    try_again=False
                except:
                    pass


            download_audio = audio.download(output_path=(f'./website/static/users/{str(current_user.id)}/songs/').replace(" ", "_"))
            base, ext = os.path.splitext(download_audio)

            video_to_audio = base + '.mp3'
            video_to_audio = video_to_audio.replace(" ", "_")
            try:
                os.rename(download_audio, video_to_audio)
            except FileExistsError:
                os.remove(download_audio)
                flash('Música já adicionada!', category='error')
                return render_template('home.html', user=current_user)

            nome_mp3_pasta =  video_to_audio.split('songs/')
            nome_mp3_pasta = str(nome_mp3_pasta[1])
            new_audio = Audio(user_id=current_user.id, title=titulo,
                    nome_na_pasta=nome_mp3_pasta, author=autor,
                    thumb=thumb)
            db.session.add(new_audio)
            print(current_playlist.audios)
            current_playlist.audios.append(new_audio)
            db.session.commit()
            flash('Música Adicionada!', category='success')


    return render_template('view_songs.html',
                           user=current_user,
                           playlist_title = playlist_title,
                           songs_list=current_playlist.audios)

@views.route('/playlists', methods=['GET', 'POST'])
@login_required
def playlists():
    return render_template('playlists.html', user=current_user)

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
    playlist = json.loads(request.data)
    print(playlist)
    playlist_title = playlist['playlistTitle']
    playlist = Playlist.query.filter_by(titulo=playlist_title).first()
    print(playlist)
    if playlist is None:
        new_playlist = Playlist(titulo=playlist_title, user_id=current_user.id)
        db.session.add(new_playlist)
        db.session.commit()
    else:
        flash('Playlist já existe!', category='error')
    return jsonify({})




@views.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404