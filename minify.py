import requests
import os

def minify(path):
    url = 'https://javascript-minifier.com/raw'
    data = {'input': open(path, 'rb').read()}
    response = requests.post(url, data=data)

    minpath = path.replace('.js', '.min.js')
    with open(minpath, 'w') as f:
        f.write(response.text)

for file in os.listdir('js'):
    minify('js/' + file)