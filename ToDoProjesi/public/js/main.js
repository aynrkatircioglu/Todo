$(document).ready(function () {

   
    function isEmpty(data) {
        var flag = false;
        data.forEach(x => {
            if ($.trim(x.value) === '')
                flag = true;
        });

        return flag;
        
    }

   
    function checkDates(start, end) {

        var startObject = new Date(moment(start, 'DD/MM/YYYY').format('MM/DD/YYYY'));
        var endObject = new Date(moment(end, 'DD/MM/YYYY').format('MM/DD/YYYY'));

        if (startObject < endObject) {
            return true;
        }
        return false;
    }

    $('#formLogin').submit(function () {

        var data = $('#formLogin').serializeArray();

        if (isEmpty(data)) {
            alert('Boş bırakılan kutucukları doldurunuz.');
            return false;
        }
    });

  
    $('#formAddTask').submit(function () {

        var data = $('#formAddTask').serializeArray();

        if (isEmpty(data)) {
            alert('Boş bırakılan kutucukları doldurunuz.');
            return false;
        }

        var baslangicTarih = $('#baslangicTarih').val();
        var bitisTarih = $('#bitisTarih').val();

        if (!checkDates(baslangicTarih, bitisTarih)) {
            alert('Başlangıç tarihi, bitiş tarihinden büyük olamaz.');
            return false;
        }
    });
});
