$(document).ready(function () {
    //
    // Setup
    //
    var round = 1;
    var points = 0;
    var roundScore = 0;
    var totalScore = 0;
    ranOut = false;
    var distance;
    //
    //  Init maps
    //
    svinitialize();
    mminitialize();
    //
    // Scoreboard & Guess button event
    //
    // Init Timer
    resetTimer();
    // Timer
    function timer() {
        count = count - 1;
        if (count <= 0) {
            console.log('finished');

            if(round==5){
                window.shouldEndGame = true;
            }

            if(round<=5){
                endRound();
            }

            clearInterval(counter);
        }
        $("#timer").html(count);
    }

    // Guess Button
    $('#guessButton').click(function () {
        if(!window.guessLatLng)
        {
            alert("Prvo morate izabrati lokaciju na mapi!");
            return;
        }

        $('#guessButton').hide();
        doGuess();
        rminitialize();

    });
    // End of round continue button click
    $('#roundEnd').on('click', '.closeBtn', function () {

        $('#roundEnd').fadeOut(500);
        $('#guessButton').show();
        // Reload maps to refresh coords

        if(window.shouldEndGame){
            endGame();
        }
        else {
            $('#scoreBoard').show();
            svinitialize();
            mminitialize();

            // Reset Timer
            resetTimer();
        }
    });
    // End of game 'play again' button click
    $('#endGame').on('click', '.playAgain', function () {
        window.location.reload();
    });

    //
    // Functions
    //
    // Reset Timer
    function resetTimer() {
        count = 30;
        counter = setInterval(timer, 1000);
    }

    // Calculate distance between points function
    function calcDistance(fromLat, fromLng, toLat, toLng) {
        return google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(fromLat, fromLng), new google.maps.LatLng(toLat, toLng));
    }

    function doGuess() {
        if (ranOut == false) {
            // Stop Counter
            clearInterval(counter);
            // Reset marker function
            function resetMarker() {
                //Reset marker
                if (guessMarker != null) {
                    guessMarker.setMap(null);
                }
            }

            // Explode latLng variables into separate variables for calcDistance function
            locLatLongs = window.locLL.toString();
            guessLatLongs = window.guessLatLng.toString();
            // Make arrays and clean from (){} characters
            window.locArray = locLatLongs.replace(/[\])}[{(]/g, '').split(',');
            window.guessArray = guessLatLongs.replace(/[\])}[{(]/g, '').split(',');
            // Calculate distance between points, and convert to kilometers
            distance = Math.ceil(calcDistance(window.locArray[0], window.locArray[1], window.guessArray[0], window.guessArray[1]) / 10);
            // Calculate points awarded via guess proximity
            function inRange(x, min, max) {
                return (min <= x && x <= max);
            }

            if (inRange(distance, 1, 2)) {        // Real basic point thresholds depending on kilometer distances
                points = 10000;
            } else if (inRange(distance, 3, 10)) {
                points = 7000 - distance*10;
            } else if (inRange(distance, 11, 100)) {
                points = 3000 - distance*10;
            } else if (inRange(distance, 101, 490)) {
                points = 500 - distance;
            } else if (inRange(distance, 491, 800)) {
                points = 10;
            } else {
                points = 0;
            }
            if(round>=5){
                window.shouldEndGame = true;
            }
            endRound();
        } else {
            // They ran out
        }
        timer();
        window.guessLatLng = '';
    }
    function endRound() {
        round++;
        if (ranOut == true) {
            roundScore = 0;
        } else {
            roundScore = points;
            totalScore = totalScore + points;
        }

        $('.round').html('Trenutna runda: <b>' + round + ' od 5</b>');
        $('.roundScore').html('Rezultat iz prošle runde: <b>' + roundScore + '</b>');
        $('.totalScore').html('Totalni rezultat: <b>' + totalScore + '</b>');
        $('#scoreBoard').hide();
        $('#guessButton').hide();

        // If distance is undefined, that means they ran out of time and didn't click the guess button
        if (typeof distance === 'undefined' || ranOut == true) {
            $('#roundEnd').html('<p>Morate biti brži, vaše vreme je isteklo!.<br/> Niste osvojili poene u ovoj rundi.<br/><br/><button class="btn btn-primary btn-large closeBtn" type="button">Nastavi</button></p></p>');
            $('#roundEnd').fadeIn();
            // Stop Counter
            clearInterval(counter);
            // Reset marker function
            function resetMarker() {
                //Reset marker
                if (guessMarker != null) {
                    guessMarker.setMap(null);
                }
            }

            window.guessLatLng = '';
            ranOut = false;
            points = 0;

        } else {
            $('#roundEnd').html('<p>Vaša lokacija je udaljena <br/><strong><h1>' + distance + '0</strong> metara</h1> <p>od markirane lokacije.</p><br/><div id="roundMap"></div><br/> <p>Dobili ste</p><h1>' + roundScore + ' poena</h1> <p>u ovoj rundi!</p><button class="btn btn-primary btn-large closeBtn" type="button">Nastavi dalje</button></p></p>');
            $('#roundEnd').fadeIn();
        }
        // Reset Params
        window.guessLatLng = '';
        ranOut = false;
    }

    function endGame() {
        roundScore = points;
        totalScore = totalScore + points;
        $('#miniMap, #pano, #guessButton, #scoreBoard, #timer').hide();
        $('#logo').html('<div class="logo"></div>');
        $('#endGame').html('<h1>Čestitamo!</h1><h2>Vaš rezultat je:</h2><h1>'
            + totalScore + '!</h1><br/><p>Šeruj ovo na:</p><br/><a class="btn btn-large facebook fb-share-button" href="https://www.facebook.com/sharer/sharer.php?src=100&p[url]=' + encodeURIComponent('http://fun.aries.rs/pronadji-se-u-beogradu/') + '" target="_blank"><i class="fa fa-facebook fa-lg"></i><span>Facebook</span></a> <a class="btn btn-large twitter" href="https://twitter.com/intent/tweet?text=Upravo+sam+osvojio+' + totalScore + '+poena+u+igri+PRONAĐI+SE+U+BEOGRADU+@AriesCTW%21&url=http://fun.aries.rs/pronadji-se-u-beogradu/" target="_blank"><i class="fa fa-twitter fa-lg"></i><span class="rps-text">Twitter</span></a></p><br/><button class="btn btn-large playAgain" type="button">Igraj ponovo?</button>');
        $('#endGame').fadeIn(500);
        $('#logo').fadeIn(700);
        $('#share').fadeIn(700);
        rminitialize();
        // We're done with the game
        window.finished = true;
    }
});
