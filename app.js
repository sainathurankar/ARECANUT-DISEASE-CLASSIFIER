Dropzone.autoDiscover = false;

var dict = {
    Mahali_Koleroga : "Disease can be controlled satisfactorily by prophylactic pre-monsoon spraying with one percent Bordeaux mixture and second spray after 40-45 days.A third spray would be necessary if the monsoon is prolonged.",
    Stem_bleeding: "Drenching the rhizosphere with propiconazole (1 ml/l) @ 15-20 l/palm along with root feeding of propiconazole (1 ml/I) @ 125 ml/palm at quarterly intervals will help in disease management.",
    Yellow_disease :"Disease can be controlled by spraying with one per cent Bordeaux mixture or Dithane M 45 @ 3 gram/Liter.",
};





function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });

    dz.on("addedfile", function () {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]);
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;

       // var url = "http://127.0.0.1:5000/classify_image";
        // var url = "http://1051690e3522.ngrok.io/classify_image";
        var url = "http://ac7751789266.ngrok.io/classify_image";

        $.post(url, {
            image_data: file.dataURL
        }, function (data, status) {
            /* 
            Below is a sample response if you have two faces in an image lets say virat and roger together.
            Most of the time if there is one person in the image you will get only one element in below array


            data = [{'class': 'Stem_bleeding', 
            'class_probability': [2.41, 1.05, 1.9, 2.5, 92.14, 24.0], 
            'class_dictionary': {'Healthy_Leaf': 0, 'Healthy_Nut': 1, 'Healthy_Trunk': 2, 
                                    'Mahali_Koleroga': 3, 'Stem_bleeding': 4, 'Yellow_ disease': 5}}]
            
            */
            console.log(data);
            if (!data || data.length == 0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();
                $("#remedyHolder").hide();
                $("#error").show();
                return;
            }
            let players = ["Healthy_Leaf", "Healthy_Nut", "Healthy_Trunk", "Mahali_Koleroga", "Stem_bleeding", "Yellow_disease"];

            let match = null;
            let bestScore = -1;
            for (let i = 0; i < data.length; ++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if (maxScoreForThisClass > bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }
            if (match) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();
                if(match.class == "Stem_bleeding" || match.class == "Mahali_Koleroga" || match.class == "Yellow_disease")
                $("#remedyHolder").show();
                if(match.class == "Healthy_Leaf" || match.class == "Healthy_Nut" || match.class == "Healthy_Trunk")
                $("#remedyHolder").hide();
                $("#resultHolder").html($(`[data-player="${match.class}"`).html());
                var string = match.class;
                document.getElementById("remedy").innerHTML=string.bold()+" : "+dict[match.class];
                let classDictionary = match.class_dictionary;
                for (let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let proabilityScore = match.class_probability[index];
                    let elementName = "#score_" + personName;
                    $(elementName).html(proabilityScore);
                }
            }
            // dz.removeFile(file);            
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();
    });
}

$(document).ready(function () {
    console.log("ready!");
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();
    $("#remedyHolder").hide();

    init();
});