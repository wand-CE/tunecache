from flask_login import UserMixin
from . import db

class Audio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    nome_na_pasta = db.Column(db.String(150))
    author = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    '''
    playlist_id = db.Column(db.Integer, db.ForeignKey('playlist.id'))
    cantor_id = db.Column(db.Integer, db.ForeignKey('cantor.id'))
    

class Playlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(150))
    capa = db.Column(db.String(150))
    audios = db.relationship('Audio')    
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class Cantor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    audios = db.relationship('Audio')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
'''
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    audios = db.relationship('Audio')
    '''
    playlists = db.relationship('Playlist')
    cantores = db.relationship('Cantor')
    '''