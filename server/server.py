import base64
import json
import numpy as np
import cv2
from keras.preprocessing.image import img_to_array
import os
from keras.models import load_model
from flask import Flask, request, jsonify


app = Flask(__name__)


@app.route('/classify_image', methods=['GET', 'POST'])
def classify_image():
    image_data = request.form['image_data']

    response = jsonify(classify_images(image_data))

    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


default_image_size = tuple((256, 256))


def convert_image_to_array(image_dir):
    try:
        image = cv2.imread(image_dir)
        if image is not None:
            image = cv2.resize(image, default_image_size)
            return img_to_array(image)
        else:
            return np.array([])
    except Exception as e:
        #print(f"Error : {e}")
        return None


__class_name_to_number = {}
__class_number_to_name = {}

__model = None


def load_saved_artifacts():
    print("loading saved artifacts...start")
    global __class_name_to_number
    global __class_number_to_name

    with open("class_dictionary.json", "r") as f:
        __class_name_to_number = json.load(f)
        __class_number_to_name = {v: k for k,
                                  v in __class_name_to_number.items()}

    global __model
    if __model is None:
        __model = load_model("Model_88.h5")

    print("loading saved artifacts...done")


def classify_images(image_base64_data, file_path=None):
    result = []

    if file_path:
        im = convert_image_to_array(file_path)
    else:
        encoded_data = image_base64_data.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img = cv2.resize(img, default_image_size)
        im = img_to_array(img)

    np_image_li = np.array(im, dtype=np.float16) / 255.0
    npp_image = np.expand_dims(np_image_li, axis=0)

    res = __model.predict(npp_image)
    itemindex = np.where(res == np.max(res))

    result.append({
        'class': __class_number_to_name[itemindex[1][0]],
        'class_probability': [round(num*100, 2) for num in __model.predict(npp_image).tolist()[0]],
        'class_dictionary': __class_name_to_number
    })
    # print(result)
    return result


if __name__ == "__main__":
    print("Starting Python Flask Server For Arecanut Disease Classification")
    load_saved_artifacts()
    app.run(port=5000)
