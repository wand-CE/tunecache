"""
Wanderson Soares dos Santos - UTF-8 - 11-04-2023
Configs for the auth system of my site
"""
import os
import shutil
from flask import Blueprint, render_template, request, flash, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import (login_user, login_required,
                         logout_user, current_user)
from . import db
from .models import User


auth = Blueprint('auth', __name__)


@auth.route('/login', methods=['GET', 'POST'])
def login():
    """Function responsible for the login page"""
    if current_user.is_authenticated:
        flash('Voce já está logado.', category='error')
        return redirect(url_for('views.all_songs'))
    elif request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()
        if user:
            if check_password_hash(user.password, password):
                flash(f'Seja bem-vindo(a) {user.first_name}', category='success')
                login_user(user, remember=True)
                return redirect(url_for('views.all_songs'))
            else:
                flash('Senha incorreta, tente novamente.', category='error')
        else:
            flash('Email não cadastrado.', category='error')
    return render_template('login.html', user=current_user)


@auth.route('/logout')
@login_required
def logout():
    """Function logout of the site"""
    logout_user()
    if request.headers.get('Service-Worker-Navigation-Mode') == 'Service-Worker':
        response = make_response(redirect(url_for('auth.login')))
        response.headers['Clear-Site-Data'] = '"cache"'
        return response

    return redirect(url_for('auth.login'))


@auth.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    """Function responsible for the sign-up page"""
    if current_user.is_authenticated:
        flash('Voce já está logado.', category='error')
        return redirect(url_for('views.all_songs'))
    elif request.method == 'POST':
        email = request.form.get('email')
        first_name = request.form.get('firstName')
        password1 = request.form.get('password1')
        password2 = request.form.get('password2')
        user = User.query.filter_by(email=email).first()
        if user:
            flash('Email já existe.', category='error')
        elif len(email) < 4:
            flash('Email deve ter mais que 3 caracteres', category='error')
        elif len(first_name) < 4:
            flash('Primeiro nome deve ter mais que 3 letras',
                  category='error')
        elif password1 != password2:
            flash('Senhas diferentes', category='error')
        elif len(password1) < 7:
            flash('A senha deve possuir pelo menos 7 caracteres.', category='error')
        else:
            new_user = User(email=email, first_name=first_name, password=generate_password_hash(
                password1, method='sha256'))
            db.session.add(new_user)
            db.session.commit()

            songs_path = f'./website/static/users/{str(new_user.id)}'
            if str(new_user.id) in os.listdir('./website/static/users/'):
                shutil.rmtree(songs_path)
            os.makedirs(songs_path)

            path = os.path.join(songs_path, 'songs')
            os.makedirs(path)

            login_user(new_user, remember=True)

            flash('Conta criada!', category='success')
            return redirect(url_for('views.all_songs'))

    return render_template('sign_up.html', user=current_user)
