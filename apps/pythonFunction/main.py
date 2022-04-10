import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import auth
import requests
import os

default_app = firebase_admin.initialize_app()
db = firestore.client()
auths = auth.Client(default_app)

def main(request):
    # Handle CORS
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '3600'
        }

        return '', 204, headers
    headers = {
        'Access-Control-Allow-Origin': '*'
    }
    # Validate Firebase session
    if 'authorization' not in request.headers:
        return {'data': {'error': True, 'message': 'Unauthorized'}}, 401, headers
    authorization = str(request.headers['authorization'])
    if not authorization.startswith('Bearer '):
        return {'data': {'error': True, 'message': 'Unauthorized'}}, 401, headers
    id_token = authorization.split('Bearer ')[1]
    decoded_token = auths.verify_id_token(id_token)
    uid = str(decoded_token['uid'])
    if uid is None or len(uid) == 0:
        return {'data': {'error': True, 'message': 'Unauthorized'}}, 401, headers
    # Get credentials
    content_type = request.headers['content-type']
    if content_type == 'application/json':
        request_json = request.get_json(silent=True)
        if request_json and 'passw' in request_json and 'user' in request_json:
            passw = request_json['passw']
            user = request_json['user']
        elif request_json and 'data' in request_json:
            # when the function is triggered using the app (httpsCallable) the data will be wrapped inside a 'data'
            # object
            if 'passw' in request_json['data'] and 'user' in request_json['data']:
                passw = request_json['data']['passw']
                user = request_json['data']['user']
            else:
                return {'data': {'error': True, 'message': 'Missing parameter(s) (user or passw)!'}}, 400, headers
        else:
            return {'data': {'error': True, 'message': 'Missing parameter(s) (user or passw)!'}}, 400, headers
    elif content_type == 'application/x-www-form-urlencoded':
        passw = request.form.get('passw')
        user = request.form.get('user')
    else:
        return {'data': {'error': True, 'message': 'Unknown content type: {}'.format(content_type)}}, 400, headers
    if user is None or passw is None:
        return {'data': {'error': True, 'message': 'Missing parameter(s) (user or passw)!'}}, 400, headers
    
    # Make sure user name is lowercase
    user = user.lower()

    url = os.environ['WEBSITE_URL']
    # Initialize Firebase
    db = firestore.client()
    # Get a cookie
    cookie = requests.get(f'{url}login.php')
    sess = cookie.cookies['PHPSESSID']
    cookies = dict(PHPSESSID=sess)
    # Validate the cookie
    auth = requests.post(f'{url}applogin.php',
                         data={'aktion': 'login', 'regid': f'PHPSESSID={sess}', 'platform': '2', 'user': user,
                               'pass': passw}, cookies=cookies)
    if auth.text == "1":
        # Get the user's data
        user_data = db.collection(u'userData').document(uid).get()
        data = {
                u'xPass': f'{passw}',
                u'xUser': f'{user}'
        }
        if user_data.exists:
            db.collection(u'userData').document(uid).update(data)
        else:
            db.collection(u'userData').document(f'{uid}').set(data)
        return {'data': {'error': False, 'message': 'Credentials verified successfully!'}}, 200, headers
    else:
        return {'data': {'error': True, 'message': 'Could not verify credentials'}}, 401, headers
