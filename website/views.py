"""
Wanderson Soares dos Santos - UTF-8 - 11-04-2023
Module responsible for the return of pages and the treatment
of the data from the users
"""
import json
import os
import re
from flask import Blueprint, render_template, request, jsonify, current_app
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
    return render_template('playlists.html',
                           user=current_user,
                           page_name='Playlists',
                           list_playlists=current_user.playlists)


@views.route('/playlists/<playlist_title>', methods=['GET', 'POST'])
@login_required
def playlists_songs(playlist_title):
    """function responsible for the individual page of the playlists"""
    current_playlist = db.session.query(Personal_playlist).filter_by(titulo=playlist_title).first()
    
    if current_playlist is None:
        return page_not_found()

    return render_template('view_songs.html',
                           user=current_user,
                           playlist_title = playlist_title,
                           playlist_id = current_playlist.id,
                           songs_list=current_playlist.audios,
                           playlist_page='yes')

@views.route('/cantores', methods=['GET', 'POST'])
@login_required
def singers():
    """function responsible for the singers collection page of the website"""
    return render_template('playlists.html',
                           user=current_user,
                           page_name='Cantores',
                           list_playlists=current_user.singers)

@views.route('/cantores/<singer_title>', methods=['GET', 'POST'])
@login_required
def view_singers(singer_title):
    """function responsible for the individual page of the singers"""    
    current_singer = db.session.query(Singer).filter_by(name=singer_title).first()
    if current_singer is None:
        return page_not_found()

    return render_template('view_songs.html',
                           user=current_user,
                           playlist_title = singer_title,
                           songs_list=current_singer.audios,
                           playlist_id = current_singer.id,
                           singer_page = 'yes',
                           url='singers_page')


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

    if 'url' in playlist_data:
        urls = playlist_youtube.video_urls
        return jsonify({ "urls" : list(urls)})

    
    if playlist is None:
        new_playlist = Personal_playlist(titulo=playlist_title, user_id=current_user.id)
        db.session.add(new_playlist)
        db.session.commit()

        return jsonify([new_playlist.titulo, new_playlist.id])

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
                    return jsonify({'Arquivo de Aúdio grande demais'}), 413

                filename = f'{(audio.title).replace(" ","_")}.mp3'

                filename = re.sub(r'[^\w\-_.]', '', filename)
                
                file_number = 1
                while True:
                    if filename in os.listdir(f'./website/static/users/{str(current_user.id)}/songs/'):
                        filename = str(str(file_number) + '_' + filename)
                        file_number += 1
                    else:
                        break
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
                elif music_request['playlist'] != 'NO':
                    current_playlist = Personal_playlist.query.filter_by(titulo=music_request['playlist']).first()
                    current_playlist.audios.append(new_audio)

                db.session.commit()

                print('ESTOU NO FINAL')

                print(new_audio.singers)

                return jsonify({
                    "id" : new_audio.id,
                    "title" : new_audio.title,
                    "user_id" : new_audio.user_id,
                    "singer" : [s.name for s in new_audio.singers],
                    "filename" : new_audio.nome_na_pasta,                    
                    "thumb": new_audio.thumb,
                    })
            except:
                atempt += 1
                if atempt == 50:
                    try_again = False
                    return jsonify({'error':'Erro interno no Servidor'}), 500

    return jsonify({'added_before': 'YES'})


@views.route('/edit-music', methods=['PUT'])
@login_required
def edit_music():
    """function responsible for editing the music data in the website"""
    music_request = json.loads(request.data)
    audio = db.session.query(Audio).filter_by(id=music_request['musicId']).first()
    audio.title = music_request['musicName']

    db.session.commit()
    return jsonify(['Música Editada'])


@views.route('/update_list_songs_playlist', methods=['PUT'])
@login_required
def edit_list_playlist():
    data = json.loads(request.data)
    list_request = data[0]

    current_playlist = Personal_playlist.query.filter_by(id=data[1]).first()

    musicas_adicionadas = []
    for audios_id in list_request:
        audio = Audio.query.filter_by(id=int(audios_id)).first()
        current_playlist.audios.append(audio)
        musicas_adicionadas.append([audio.id, audio.title, current_user.id,
                                    [s.name for s in audio.singers],
                                    audio.nome_na_pasta, audio.thumb])
    db.session.commit()

    return musicas_adicionadas


@views.route("/edit-playlist-title", methods=['PUT'])
@login_required
def edit_playlist_title():
    playlist_data = json.loads(request.data)
    playlist_id = int(playlist_data[0])    

    playlist = db.session.query(Personal_playlist).filter_by(id=playlist_id).first()
    playlist.titulo = playlist_data[1]

    db.session.commit()

    return jsonify('Nome da playlist editada')


@views.route('/delete-playlist', methods=['DELETE'])
@login_required
def delete_playlist():
    playlist_id = int(json.loads(request.data))

    playlist = Personal_playlist.query.get(playlist_id)

    db.session.delete(playlist)
    db.session.commit()

    return jsonify(['Playlist Excluída'])


@views.errorhandler(404)
def page_not_found():
    """function that returns the 404 page error"""    
    return render_template('404.html', user=current_user), 404


@views.route('/sw.js', methods=['GET'])
@login_required
def sw():
    return current_app.send_static_file('js/sw.js')    


@views.route('/user_id', methods=['GET'])
@login_required
def user_id():
    return jsonify(str(current_user.id))


@views.route('/add_to_singer', methods=['PUT'])
@login_required
def add_to_singer():
    data_html = json.loads(request.data)
    singer_id = data_html[1]
    audio_id = data_html[0]

    current_singer = Singer.query.filter_by(id=singer_id).first()

    if current_singer:
        audio = Audio.query.filter_by(id=int(audio_id)).first()
        current_singer.audios.append(audio)        
        db.session.commit()
        list_singers = []
        for singer in audio.singers:
            if singer != audio.singers[0]:
                list_singers.append(' ' + singer.name)
            else:
                list_singers.append(singer.name)

        return jsonify({
                    "id" : audio.id,
                    "title" : audio.title,                 
                    "user_id" : audio.user_id,
                    "singer" : list_singers,
                    "filename" : audio.nome_na_pasta,                    
                    "thumb": audio.thumb,
                    })
    return jsonify({'erro':'Erro ao adicionar música'})


@views.route('/add-singer', methods=['POST'])
@login_required
def add_singer():
    """function responsible for add the singer in the website"""
    singer_data = json.loads(request.data)
    singer_title = singer_data['singerName']

    singer = Singer.query.filter_by(name=func.lower(singer_title)).first()


    if singer is None:
        new_singer = Singer(name=singer_title, user_id=current_user.id)
        db.session.add(new_singer)
        db.session.commit()

        return jsonify([new_singer.name, new_singer.id])

    return jsonify({})


@views.route("/edit-singer-name", methods=['PUT'])
@login_required
def edit_singer_name():
    singer_data = json.loads(request.data)
    singer_id = int(singer_data[0])

    singer = db.session.query(Singer).filter_by(id=singer_id).first()
    singer.name = singer_data[1]

    db.session.commit()

    return jsonify('Nome do cantor editado')


@views.route('/delete-singer', methods=['DELETE'])
@login_required
def delete_singer():
    singer_id = int(json.loads(request.data))

    singer = Singer.query.get(singer_id)

    db.session.delete(singer)
    db.session.commit()

    return jsonify(['Cantor Excluído'])


@views.route('/remove-from-playlist-singer', methods=['PUT'])
@login_required
def remove_from_playlistSinger():
    data_from_html = json.loads(request.data)

    page_name = data_from_html[0]
    id_playlist_singer = int(data_from_html[1])
    id_music = int(data_from_html[2])

    if page_name == 'singer':
        singer = Singer.query.get(id_playlist_singer)
        audio = Audio.query.get(id_music)

        if singer:
            if audio in singer.audios:
                singer.audios.remove(audio)
                db.session.commit()

    elif page_name == 'playlist':
        playlist = Personal_playlist.query.get(id_playlist_singer)
        audio = Audio.query.get(id_music)

        if playlist:
            if playlist in audio.playlists:
                audio.playlists.remove(playlist)
                db.session.commit()

    return jsonify({})
