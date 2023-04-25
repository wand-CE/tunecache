from flask import Blueprint, render_template, request, flash, jsonify
from flask_login import login_required, current_user
from .models import Audio
from . import db
import json, os
from pytube import YouTube

views = Blueprint('views', __name__)

@views.route('/')
@login_required
def home():
    return render_template('home.html', user=current_user)

@views.route('/playlists', methods=['GET', 'POST'])
@login_required
def playlists():
    return render_template('playlists.html', user=current_user)

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

            
           
            audio = yt.streams.filter(only_audio=True).first()
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
            db.session.add(new_audio)
            db.session.commit()
            flash('Música Adicionada!', category='success')

    return render_template('all_songs.html', user=current_user)


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
