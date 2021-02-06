'use strict';


var express = require('express');
var router = express.Router();
var moment = require('moment');                     // Tarih ve zaman verilerini iyi yönetmek için
const { v4: uuidv4 } = require('uuid');             // Benzersiz kod oluşturmak için
const fs = require('fs');                           // Dosya okuma ve yazma işlemleri için.
const { post } = require('jquery');


const dataPath = './data/data.json';
const backupDataPath = './data/data.backup.json';


const readFile = (
    callback,
    returnJson = false,
    filePath = dataPath,
    encoding = 'utf8'
) => {
    fs.readFile(filePath, encoding, (err, data) => {
        if (err) {
            throw err;
        }

        callback(returnJson ? JSON.parse(data) : data);
    });
};

const writeFile = (
    fileData,
    callback,
    filePath = dataPath,
    encoding = 'utf8'
) => {
    fs.writeFile(filePath, fileData, encoding, err => {
        if (err) {
            throw err;
        }
        callback();
    });
};


function custom_sort(a, b) {
    return new Date(a.bitisTarih).getTime() - new Date(b.bitisTarih).getTime();
}

router.get('/', function (req, res) {
   
    if (req.session.loggedUser)
        res.redirect('/tasks');
    else
        res.redirect('/login');

});

router.get('/tasks', function (req, res) {

    if (!req.session.loggedUser)
        return res.redirect('/login');
  
    readFile(data => {
        
        var userData = data.filter(user => user.kullaniciAd === req.session.loggedUser)[0];
        var categorizedData = {
            "gorevler": {
                "beklemede": [
                    ...userData.gorevler
                        .filter(gorev => gorev.durum === 'beklemede')
                        .sort(custom_sort)
                ],
                "devam ediyor": [
                    ...userData.gorevler
                        .filter(gorev => gorev.durum === 'devam ediyor')
                        .sort(custom_sort)],
                "tamamlandı": [
                    ...userData.gorevler
                        .filter(gorev => gorev.durum === 'tamamlandı')
                        .sort(custom_sort)
                ]
            }
        };
        
        const surecler = ["beklemede", "devam ediyor", "tamamlandı"];
        surecler.forEach(surec => {
            for (let i = 0; i < categorizedData.gorevler[surec].length; i++) {
                var basTarih = moment(categorizedData.gorevler[surec][i].baslangicTarih, 'MM/DD/YYYY');
                var bitTarih = moment(categorizedData.gorevler[surec][i].bitisTarih, 'MM/DD/YYYY');
                categorizedData.gorevler[surec][i].baslangicTarih = basTarih.format('DD/MM/YYYY');
                categorizedData.gorevler[surec][i].bitisTarih = bitTarih.format('DD/MM/YYYY');
            }
        });

        res.render('tasks', { data: categorizedData });

    }, true);
});


router.get('/login', function (req, res) {
   
    if (req.session.loggedUser)
        res.redirect('/tasks');   
    res.render('login', { title: 'To Do Projesi - Giriş yap' });

});


router.post('/login', function (req, res) {
   
    const postObj = req.body;
    readFile(data => {

        var result = data
            .filter(user => user.kullaniciAd === postObj.kullaniciAd
                && user.kullaniciSifre === postObj.kullaniciSifre);

       
        var errorMessage;

       
        if (!(result.length)) {
            errorMessage = true;
        }
        else {
            req.session.loggedUser = postObj.kullaniciAd;
            return res.redirect('/tasks');
        }

        res.render('login', {
            title: 'To Do Projesi - Giriş yap',
            error: errorMessage
        });
    }, true);

});

router.get('/logout', function (req, res) {
    
    req.session.destroy();
    res.redirect('/login');
});


router.get('/tasks/add', function (req, res) {
    
    if (!req.session.loggedUser)
        return res.redirect('/login');
    res.render('addTask', { title: 'To Do Projesi - Görev ekle' });

});


router.post('/tasks/add', function (req, res) {

   
    if (!req.session.loggedUser)
        res.redirect('/login');
    var newTask = JSON.parse(JSON.stringify(req.body));
    newTask.id = uuidv4();
    var baslangicTarih = moment(req.body.baslangicTarih, 'DD/MM/YYYY');
    var bitisTarih = moment(req.body.bitisTarih, 'DD/MM/YYYY');
    newTask.baslangicTarih = baslangicTarih.format('MM/DD/YYYY');
    newTask.bitisTarih = bitisTarih.format('MM/DD/YYYY');

    readFile(data => {

        
        var userIndex = data.findIndex(row => row.kullaniciAd === req.session.loggedUser);
        
        if (userIndex < 0)
           
            return res.send('Bir problem var');

        
        data[userIndex].gorevler.push(newTask);

   
        writeFile(JSON.stringify(data, null, 2), () => {
           
            res.render('addTask', { message: "success" });
        });

    }, true);
    
});


router.get('/tasks/start/:id', function (req, res) {
   
    if (!req.session.loggedUser)
        res.redirect('/login');

    readFile(data => {

        
        const taskId = req.params['id'];
        var userIndex = data.findIndex(row => row.kullaniciAd === req.session.loggedUser);

       
        if (userIndex < 0)
            return res.send('Bir problem var');

        
        var taskIndex = data[userIndex].gorevler.findIndex(row => row.id === taskId);

        
        if (taskIndex < 0)
            return res.send('Bir problem var');

        
        data[userIndex].gorevler[taskIndex].durum = 'devam ediyor';

        
        writeFile(JSON.stringify(data, null, 2), () => {
           
            res.redirect('/tasks');
        });   
    }, true);
});


router.get('/tasks/complete/:id', function (req, res) {
    
    if (!req.session.loggedUser)
        res.redirect('/login');

    readFile(data => {

       
        const taskId = req.params['id'];

       
        var userIndex = data.findIndex(row => row.kullaniciAd === req.session.loggedUser);

        
        if (userIndex < 0)
            return res.send('Bir problem var');

       
        var taskIndex = data[userIndex].gorevler.findIndex(row => row.id === taskId);

        
        if (taskIndex < 0)
            return res.send('Bir problem var');

       
        data[userIndex].gorevler[taskIndex].durum = 'tamamlandı';

        
        writeFile(JSON.stringify(data, null, 2), () => {
       
            res.redirect('/tasks');
        });
    }, true);
});


router.get('/tasks/delete/:id', function (req, res) {
    
    if (!req.session.loggedUser)
        res.redirect('/login');

    readFile(data => {

        
        const taskId = req.params['id'];

       
        var userIndex = data.findIndex(row => row.kullaniciAd === req.session.loggedUser);

       
        if (userIndex < 0)
            return res.send('Bir problem var');

       
        var taskIndex = data[userIndex].gorevler.findIndex(row => row.id === taskId);

        
        if (taskIndex < 0)
            return res.send('Bir problem var');

        data[userIndex].gorevler.splice(taskIndex, 1);
        
        writeFile(JSON.stringify(data, null, 2), () => {
        
            res.redirect('/tasks');
        });
    }, true);
});


router.get('/eskihalegetir', function (req, res) {
    readFile(data => {

       
        writeFile(JSON.stringify(data, null, 2), () => {
            res.send('Veriler eski hale getirildi');
        });
    }, true, backupDataPath);
});


module.exports = router;
