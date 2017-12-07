const admin = require('firebase-admin');

module.exports = (req, res) => {
    
    if (!req.body.otp) {
        return res.status(404).send({
            message: 'Please enter a valid OTP (4 Digit)'
        })
    }
    

    // Sanitazion
    const otp = String(req.body.otp).replace(/[^\d]/g, '');
    const phone = String(req.body.phone).replace(/[^\d]/g, '');
    // const code = parseInt(String(req.body.code).replace(/[^\d]/g, ''))
    // res.send(phone)

    admin.auth().getUser(phone)
        .then(() => {
            // res.send({otp, phone})
            //todo baca code dari database sesuai nomor telp
            const ref = admin.database().ref('users/' + phone)

            ref.on('value', (snapshot) => {
                ref.off();

                const userData = snapshot.val();

                if (String(userData.code) !== otp) {
                    return res.send({
                        message: 'Code does not match'
                    })
                }
                if (!userData.valid) {
                    return res.status(402).send({
                        message: 'This code has been used'
                    })
                }
                ref.update({ valid: false });
                
                admin.auth().createCustomToken(phone)
                .then((token) => {
                    res.send({ token: token })
                });
            })
        })
        .catch((error) => {
            return res.status(403).send(error)
        })
            
};
