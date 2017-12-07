const admin = require('firebase-admin');
const axios = require('axios')
const FormData = require('form-data')
// const client = require('./../twilio-helper');

let sendMesabotRequest = (phone, code) => {
    const body = {
        "destination": phone,
        "text": "Your Code Is: " + code,
        // Uncomment line di bawah untuk penggunaan fitur masking
        // "masking" => "NAMA_MASKING",
    }

    const headers = {
        "client-id": "YXpRKz1F",
        "client-secret": "QZEhXDhS",
        "content-type": "application/json"
    }

    return axios({
        method: "POST",
        url: "https://mesabot.com/api/v2/send",
        data: body,
        headers: headers
    })
}

let sendTwillioRequest = (phone, code) => {
    let data = new FormData();

    let destinationPhoneNumber = '+62' + phone.substr(1, phone.length - 1);

    data.append('From', '+12243850972');
    data.append('To', destinationPhoneNumber);
    data.append('Body', `Your OTP code is ${code}`)

    let headers = Object.assign({}, data.getHeaders(), {'authorization': 'Basic QUNlMTFhYWE3MjQyOWE4MDliZjI4NTcwMjJjMzZmNTNhMjpiNTY0MDg0NjZkMjljNjA5NjIyZGRhNWM4OGMxNmEwZg=='})

    return axios({
        method: "POST",
        url: "https://api.twilio.com/2010-04-01/Accounts/ACe11aaa72429a809bf2857022c36f53a2/Messages.json",
        headers: headers,
        data: data
    })
}

module.exports = (req, res) => {

    //todo
    // terima no telp
    if (!req.body.phone) {
        return res.status(422).send({ 
            message: 'please enter a valid phone number' 
        });
    }
    
    //sanitizing
    const phone = String(req.body.phone).replace(/[^\d]/g,'')

    admin.auth().getUser(phone)
        .then((userRecord) => {
            
            // TODO
            // Create Code
            const angka = Math.random() * 8999 + 1000;
            const code = Math.floor(angka);

            sendTwillioRequest(phone, code)
                .then((r) => {
                    admin.database().ref('users/' + phone)
                        .update({ code: code, valid: true })
                        .then(() => {
                        return res.send({ message: 'code has been sent' });
                        })
                        .catch((error) => {
                            return res.send({ message: 'gagal save database' })
                        });
                });
        })
        .catch((err) => {
            console.log(err)
            // Assume there is no user yet
            admin.auth().createUser({ uid: phone })
                .then(user => {
                    const angka = Math.random() * 8999 + 1000;
                    const code = Math.floor(angka);
        
                    sendTwillioRequest(phone, code)
                        .then((r) => {
                            
                            admin.database().ref('users/' + phone)
                                .update({ code: code, valid: true })
                                .then(() => {
                                    return res.send({ message: 'code has been sent' });
                                })
                                .catch((error) => {
                                    return res.send({ message: 'gagal save database' })
                                });
                    });
            })
        })
}         
                    
                    
// admin.auth().getUser(phone)
//     .then((userRecord) => {
//         const angka = Math.random() * 8999 + 1000;
//         const code = Math.floor(angka);
//         return res.send(code, phone)
//     })
//     .catch((err) => {
//         console.log(err)
//     })
// }
    
    // admin.auth().createUser({ uid: phone })
    // .then(() => createOTP(phone))
        
    //     // res.send({ message: 'code created' + code, phone, body, headers });
    // .catch((err) => createOTP(phone))
    //     // res.send('User Already Exist')
    // })
    // const createOTP = (destination) => {
    //         // res.send('creating OTP')
    //         const angka = Math.random() * 8999 + 1000
    //         const code = Math.floor(angka)
    //         const body = {
    //             "destination": destination,
    //             "text": code,
    //         }
    //         const headers = {
    //             "client-id": "YXpRKz1F",
    //             "client-secret": "QZEhXDhS",
    //             "content-type": "application/json"
    //         }
    //         admin.database().ref('users/' + destination)
    //         .update({ code: code, valid: true })
    //         .then(() => {
    //         return res.send({ message: 'code has been sent' + code, phone, body, headers });
    //     });
    //     };
