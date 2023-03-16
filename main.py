
import os, uuid, traceback
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv                          # LOCAL SETUP ONLY
from google.cloud import vision, storage, datastore

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

'''
CONSTANTS
'''
# load_dotenv('.env')                                     # LOCAL SETUP ONLY
project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
bucket_name = 'precise-ray-371620.appspot.com'
storage_path = 'https://storage.googleapis.com/{}'.format(bucket_name)
client = datastore.Client()

'''
APIs
'''
def get_category(photo_file):
    uri = 'gs://{}/{}'.format(bucket_name, photo_file)              # get file from bucket
    vision_client = vision.ImageAnnotatorClient()                   # get vision api client
    image = vision.Image()
    image.source.image_uri = uri                                    # send the image
    response = vision_client.label_detection(image=image, max_results=1)
    
    label = response.label_annotations[0].description                # return the label with most probability 

    if label.lower() in ['cat', 'dog', 'tiger', 'lion', 'elephant', 'mammal']: return 'animals'
    elif label.lower() in ['flowers', 'flower', 'subflower', 'rose', 'jasmine', 'lotus']: return 'flowers'
    elif label.lower() in ['forehead', 'head', 'eyes', 'nose', 'person', 'boy', 'girl', 'man', 'woman', 'lady', 'body']: return 'people'
    else: return 'others'

'''
ROUTES
'''
@app.route('/')
def index():
    return jsonify({"data": "Some random data."}), 200


# photobook page with optional category filter
@app.route('/photobook',defaults={'category': None})
def photobook(category = None):
    try:
        category = request.args.get('category', None)
        query = client.query(kind='Photos')
        
        if category: query.add_filter('category', '=', category.lower())
        
        return jsonify(list(query.fetch())), 200
    
    except Exception as e:
        print(f"== EXCEPTION == photobook\n{traceback.print_exc()}\n")
        return jsonify({"data": "Something went wrong. Please check logs on the server :/ "}), 500     # Exception handling


# Common API for post / update with optional params
@app.route('/post', methods=['POST', 'GET'])
def post():
    try:
        uid = request.form.get('uid', None)
        name = request.form.get('name', None)
        location = request.form.get('location', None)
        date = request.form.get('date', None)
        file = request.form.get('file', None)
        category = request.form.get('category', None)
        
        # Make sure we have enough stuff to work with
        if not uid:
            if not name or not location or not date:
                return jsonify({"Error":f"Missing data! name:{name}, Location:{location}, date:{date}"}), 501
        else:
            if not name and not location and not date and not category and not file:
                return jsonify({"Error":f"Need some data! name:{name}, Location:{location}, date:{date}"}), 501
        
        # Use existing entity if we have UID, else create new
        if uid:
            query = client.query(kind='Photos')
            query.add_filter('uid', '=', uid.lower())
            
            

            if not len(list(query.fetch())): 
                return jsonify({"Error": f"No data with UID: {uid}"}), 502
            
            entity = list(query.fetch())[0]
        
        else:
            key = client.key('Photos')
            entity = datastore.Entity(key=key)

        # Check if we need to update / upload a file
        f = request.files.get('image') if not file else None
        
        if f or file:
            local_file = f'temp_{f.filename}' if not file else file
            target_file = str(uuid.uuid4())
            if not file: f.save(local_file)

            # make it public!
            bucket = storage.Client().bucket(bucket_name)
            blob = bucket.blob(target_file)
            blob.upload_from_filename(local_file)

            blob.acl.reload() # reload the ACL of the blob
            acl = blob.acl
            acl.all().grant_read()
            acl.save()

            # create thumbnail and save as 'thumbnail/<file-name>'
            img = Image.open(local_file)
            SIZE = (img.width/(img.height/300), 300)
            img.thumbnail(SIZE)

            img.save(f'thumbnail_{local_file}')

            # make it public!
            blob = bucket.blob(f'thumbnail_{target_file}')
            blob.upload_from_filename(f'thumbnail_{local_file}')

            blob.acl.reload() # reload the ACL of the blob
            acl = blob.acl
            acl.all().grant_read()
            acl.save()

            # Comment for local setup
            os.remove(f'thumbnail_{local_file}')
            os.remove(local_file)

            entity['filename'] = f'{storage_path}/{target_file}'
            entity['thumbnail'] = f'{storage_path}/thumbnail_{target_file}'

            if not uid: entity['uid'] = target_file
            category = get_category(target_file)
        
        # update all the stuff which was sent to us
        if category: entity['category'] = category.lower()
        
        if date: entity['date'] = date.lower()
        if name: entity['name'] = name.lower()
        if location: entity['location'] = location.lower()
        
        client.put(entity)
        print("ENTRY: " , entity)
        
        return jsonify({"data": entity}), 200
    
    except Exception as e:
        print(f"== EXCEPTION == post\n{traceback.print_exc()}\n")
        return jsonify({"data": "Something went wrong. Please check logs on the server :/ "}), 500     # Exception handling


@app.route('/delete', methods=['POST', 'GET'], defaults={'uid': None})
def delete(uid=None):
    try:
        uid = request.args.get('uid', None)
        if not uid: 
            return jsonify({"Error": f"Please send the UID of photo to be deleted"}), 501

        query = client.query(kind='Photos')
        query.add_filter('uid', '=', uid)
        query_result = list(query.fetch())    

        if not len(query_result): 
            return jsonify({"Error": f"No data with UID: {uid}"}), 502
        
        # delete from datastore
        client.delete((query_result)[0].key)

        # delete from client
        bucket = storage.Client().bucket(bucket_name)
        blob = bucket.blob(uid)
        blob.delete()

        blob = bucket.blob(f'thumbnail_{uid}')
        blob.delete()

        return jsonify({'data': f'Entity {uid} has been deleted successfully!'}), 200
    
    except Exception as e:
        print(f"== EXCEPTION == delete\n{traceback.print_exc()}\n")
        return jsonify({"data": "Something went wrong. Please check logs on the server :/ "}), 500     # Exception handling


'''
DEPLOY
'''
if __name__ == '__main__':
    # app.run(host='127.0.0.1', port=8080, debug=True)
    app.run(host='0.0.0.0', port=8080, debug=True)