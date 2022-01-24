//! Copyright ©; 2019-2022 Nikita Paniukhin

function urlencode(data) {
    let res = [];
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            res.push(key + '=' + encodeURIComponent(data[key]));
        }
    }
    return res.join('&');
}

function ajax(method, path, data = {}, success = () => {}, error = () => {}, complete = () => {}, headers = {}) {

    let request = false;
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();

    } else if (window.ActiveXObject) {
        try {
            request = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (CatchException) {
            request = new ActiveXObject("Msxml2.XMLHTTP");
        }
    }

    if (!request) {
        console.log("Can not create XMLHttpRequest");
        return;
    }

    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200) {
                success(request);
            } else {
                error(request);
            }
            complete(request);
        }
    }

    data = urlencode(data);

    if (method.toLowerCase() == "get" && data.length > 0) path += "?" + data;

    request.open(method, path, true);

    for (let header in headers) request.setRequestHeader(header, headers[header]);

    if (method.toLowerCase() == "post") {
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
        request.send(data);
    } else {
        request.send(null);
    }
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomDate(from, to) {
    return new Date(random(from.getTime(), to.getTime()));
}

function leadingZeros(n, totalDigits) {
    n = n.toString();
    var pd = '';
    for (i = 0; i < (totalDigits - n.length); ++i) pd += '0'; 
    return pd + n.toString();
}


// =====================================================================================================================

var start_date = new Date(2017, 5, 10), // 2017-05-10: high res starts ~here
    end_date = (d => new Date(d.setDate(d.getDate() - 1)))(new Date); // Yesterday

var background1 = document.getElementById("background1"),
    background2 = document.getElementById("background2"),
    description = document.getElementById("description"),
    description_link = description.getElementsByTagName("a")[0];

var api;


function changeBackground() {
    let image_date = getRandomDate(start_date, end_date);

    let image_name = leadingZeros(image_date.getUTCFullYear(), 4) + '-'
                   + leadingZeros(image_date.getUTCMonth() + 1, 2) + '-'
                   + leadingZeros(image_date.getUTCDate(), 2);

    // console.log(image_name);

    background2.style.visibility = "visible";
    background2.src = "api/US/images/" + image_name + ".jpg";

    background2.onload = () => {
        background2.style.opacity = 1;

        if (description.hasAttribute("firstrun")) {
            description.removeAttribute("firstrun");
            description.style.display = "block";

            description_link.href = "api/US/images/" + image_name + ".jpg";
            description_link.innerHTML = api[image_name];

        } else {
            description.style.opacity = 0;

            setTimeout(() => {
                description_link.href = "api/US/images/" + image_name + ".jpg";
                description_link.innerHTML = api[image_name];
                description.style.opacity = 1;
            }, 600);
        }

        setTimeout(() => {
            background1.src = background2.src;

            background1.onload = () => {
                background2.style.visibility = "hidden";
                background2.style.opacity = 0;
            }
        }, 1200);
    }
}

ajax(
    "GET",
    "src/website/api/US.json",
    {},
    success = (req) => {
        api = JSON.parse(req.responseText);
        // console.log(api);

        changeBackground();
        setInterval(changeBackground, 5000);
    },
    error = () => {
        alert("Error: can not load /src/website/api/US.json");
        exit();
    }
);

// var best_images = [
//     ["US", "2021-08-31.jpg"],
//     ["US", "2021-09-09.jpg"],
//     ["US", "2021-10-06.jpg"],
//     ["US", "2021-10-07.jpg"],
//     ["US", "2021-10-17.jpg"],
//     ["US", "2021-10-19.jpg"],
//     ["US", "2021-10-23.jpg"]
// ];
