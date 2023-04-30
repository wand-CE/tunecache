from flask_login import UserMixin
from . import db

playlist_audios = db.Table('playlist_audios',
    db.Column('audio_id', db.Integer, db.ForeignKey('audio.id')),
    db.Column('playlist_id', db.Integer, db.ForeignKey('playlist_personal.id')))

cantor_audios = db.Table('cantor_audios',
    db.Column('audio_id', db.Integer, db.ForeignKey('audio.id')),
    db.Column('cantor_id', db.Integer, db.ForeignKey('cantor.id')))

class Audio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    video_id = db.Column(db.String(30))# trocar para audio_id depois
    title = db.Column(db.String(50))
    nome_na_pasta = db.Column(db.String(100))
    author = db.Column(db.String(50))
    thumb = db.Column(db.String(50))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    playlists = db.relationship('Playlist_personal', backref='audios', secondary=playlist_audios)
    cantores = db.relationship('Cantor', backref='audios', secondary=cantor_audios)


class Playlist_personal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(150))
    url_capa = db.Column(db.String(150))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))


class Cantor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    audios = db.relationship('Audio', backref='user')
    playlists = db.relationship('Playlist_personal', backref='user')
    cantores = db.relationship('Cantor', backref='user')
