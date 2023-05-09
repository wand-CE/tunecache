"""
Wanderson Soares dos Santos - UTF-8 - 11-04-2023
Module responsible for run the app
"""
from website import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
 