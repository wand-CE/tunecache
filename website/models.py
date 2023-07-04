"""
Wanderson Soares dos Santos - UTF-8 - 11-04-2023
Model for the database of my site
"""
from flask_login import UserMixin
from . import db

playlist_audios = db.Table('playlist_audios',
    db.Column('audio_id', db.Integer, db.ForeignKey('audio.id')),
    db.Column('playlist_id', db.Integer, db.ForeignKey('personal_playlist.id')))

singer_audios = db.Table('singer_audios',
    db.Column('audio_id', db.Integer, db.ForeignKey('audio.id')),
    db.Column('singer', db.Integer, db.ForeignKey('singer.id')))

class Audio(db.Model):
    """Model of table for the Audios"""
    id = db.Column(db.Integer, primary_key=True)
    video_id = db.Column(db.String(30))# trocar para audio_id depois
    title = db.Column(db.String(50))
    nome_na_pasta = db.Column(db.String(100))
    thumb = db.Column(db.String(50))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    playlists = db.relationship('Personal_playlist', backref='audios', secondary=playlist_audios)
    singers = db.relationship('Singer', backref='audios', secondary=singer_audios)


class Personal_playlist(db.Model):
    """Model of table for the playlists"""
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(150))
    url_capa = db.Column(db.String(150))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))


class Singer(db.Model):
    """Model of table for the Singers"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))


class User(db.Model, UserMixin):
    """Model of table for the Users"""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    audios = db.relationship('Audio', backref='user')
    playlists = db.relationship('Personal_playlist', backref='user')
    singers = db.relationship('Singer', backref='user')
