var isHolding = {
    s: false,
    d: false,
    f: false,
    ' ': false,
    j: false,
    k: false,
    l: false
  };
  
  var hits = { perfect: 0, good: 0, bad: 0, miss: 0 };
  var multiplier = {
    perfect: 1,
    good: 0.8,
    bad: 0.5,
    miss: 0,
    combo40: 1.05,
    combo80: 1.10
  };
  var isPlaying = false;
  var speed = 0;
  var combo = 0;
  var maxCombo = 0;
  var score = 0;
  var animation = 'moveDown';
  var startTime;
  var trackContainer;
  var tracks;
  var keypress;
  var comboText;
  
  var initializeNotes = function () {
    var noteElement;
    var trackElement;
  
    while (trackContainer.hasChildNodes()) {
      trackContainer.removeChild(trackContainer.lastChild);
    }
  
    song.sheet.forEach(function (key, index) {
      trackElement = document.createElement('div');
      trackElement.classList.add('track');
  
      key.notes.forEach(function (note) {
        noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.classList.add('note--' + index);
        noteElement.style.backgroundColor = key.color;
        noteElement.style.animationName = animation;
        noteElement.style.animationTimingFunction = 'linear';
        noteElement.style.animationDuration = note.duration - speed + 's';
        noteElement.style.animationDelay = note.delay + speed + 's';
        noteElement.style.animationPlayState = 'paused';
        trackElement.appendChild(noteElement);
      });
  
      trackContainer.appendChild(trackElement);
      tracks = document.querySelectorAll('.track');
    });
  };
  
  var setupSpeed = function () {
    var buttons = document.querySelectorAll('.btn--small');
  
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (this.innerHTML === '1x') {
          buttons[0].className = 'btn btn--small btn--selected';
          buttons[1].className = 'btn btn--small';
          buttons[2].className = 'btn btn--small';
          speed = parseInt(this.innerHTML) - 1;
        } else if (this.innerHTML === '2x') {
          buttons[0].className = 'btn btn--small';
          buttons[1].className = 'btn btn--small btn--selected';
          buttons[2].className = 'btn btn--small';
          speed = parseInt(this.innerHTML) - 1;
        } else if (this.innerHTML === '3x') {
          buttons[0].className = 'btn btn--small';
          buttons[1].className = 'btn btn--small';
          buttons[2].className = 'btn btn--small btn--selected';
          speed = parseInt(this.innerHTML) - 1;
        }
  
        initializeNotes();
      });
    });
  };
  
  
  var updateAnimation = function () {
    animation = 'moveDownFade';
    initializeNotes();
  };
  
  var setupStartButton = function () {
    var startButton = document.querySelector('.btn--start');
    startButton.addEventListener('click', function () {
      isPlaying = true;
      startTime = Date.now();
  
      document.querySelector('.menu').style.opacity = 0;
            $(".song")[0].contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
        document.querySelectorAll('.note').forEach(function (note) {
          note.style.animationPlayState = 'running';
        });
    });
  };
  
 
  var setupNoteMiss = function () {
    trackContainer.addEventListener('animationend', function (event) {
      var index = event.target.classList.item(1)[6];
  
      displayAccuracy('miss');
      updateHits('miss');
      updateCombo('miss');
      updateMaxCombo();
      removeNoteFromTrack(event.target.parentNode, event.target);
      updateNext(index);
    });
  };
 
  var setupKeys = function () {
    document.addEventListener('keydown', function (event) {
      var keyIndex = getKeyIndex(event.key);
  
      if (Object.keys(isHolding).indexOf(event.key) !== -1
        && !isHolding[event.key]) {
        isHolding[event.key] = true;
        keypress[keyIndex].style.display = 'block';
  
        if (isPlaying && tracks[keyIndex].firstChild) {
          judge(keyIndex);
        }
      }
    });
  
    document.addEventListener('keyup', function (event) {
      if (Object.keys(isHolding).indexOf(event.key) !== -1) {
        var keyIndex = getKeyIndex(event.key);
        isHolding[event.key] = false;
        keypress[keyIndex].style.display = 'none';
      }
    });
  };
  
  var getKeyIndex = function (key) {
    if (key === 's') {
      return 0;
    } else if (key === 'd') {
      return 1;
    } else if (key === 'f') {
      return 2;
    } else if (key === ' ') {
      return 3;
    } else if (key === 'j') {
      return 4;
    } else if (key === 'k') {
      return 5;
    } else if (key === 'l') {
      return 6;
    }
  };
  
  var judge = function (index) {
    var timeInSecond = (Date.now() - startTime) / 1000;
    var nextNoteIndex = song.sheet[index].next;
    var nextNote = song.sheet[index].notes[nextNoteIndex];
    var perfectTime = nextNote.duration + nextNote.delay;
    var accuracy = Math.abs(timeInSecond - perfectTime);
    var hitJudgement;
  
    if (accuracy > (nextNote.duration - speed) / 4) {
      return;
    }
  
    hitJudgement = getHitJudgement(accuracy);
    displayAccuracy(hitJudgement);
    showHitEffect(index);
    updateHits(hitJudgement);
    updateCombo(hitJudgement);
    updateMaxCombo();
    calculateScore(hitJudgement);
    removeNoteFromTrack(tracks[index], tracks[index].firstChild);
    updateNext(index);
  };
  
  var getHitJudgement = function (accuracy) {
    if (accuracy < 0.1) {
      return 'perfect';
    } else if (accuracy < 0.2) {
      return 'good';
    } else if (accuracy < 0.3) {
      return 'bad';
    } else {
      return 'miss';
    }
  };
  
  var displayAccuracy = function (accuracy) {
    var accuracyText = document.createElement('div');
    accuracyText.innerHTML = accuracy;
  };
  
  var showHitEffect = function (index) {
    var key = document.querySelectorAll('.key')[index];
    var hitEffect = document.createElement('div');
    hitEffect.classList.add('key__hit');
    key.appendChild(hitEffect);
  };
  
  var updateHits = function (judgement) {
    hits[judgement]++;
  };
  
  var updateCombo = function (judgement) {
    
    if (judgement === 'bad' || judgement === 'miss') {
      combo = 0;
      comboText.innerHTML = '';
      combo_word.innerHTML = '';
      combo_word.style.opacity = 0;
    } else {
      // $("#combo_word").animate({top: "0px"}, 1);
      $(".hit").animate({top: "50%"}, 1)
      combo_word.innerHTML = "<h4>combo</h4>";
      combo_word.style.opacity = 0.7;
      comboText.innerHTML = ++combo;
      // $("#combo_word").animate({top: "30px"}, 20);
      $(".hit").animate({top: "55%"}, 20);
    }
  };
  
  var updateMaxCombo = function () {
    maxCombo = maxCombo > combo ? maxCombo : combo;
  };
  
  var calculateScore = function (judgement) {
    if (combo >= 80) {
      score += 1000 * multiplier[judgement] * multiplier.combo80;
    } else if (combo >= 40) {
      score += 1000 * multiplier[judgement] * multiplier.combo40;
    } else {
      score += 1000 * multiplier[judgement];
    }
  };
  
  var removeNoteFromTrack = function (parent, child) {
    parent.removeChild(child);
  };
  
  var updateNext = function (index) {
    song.sheet[index].next++;
  };
  
  window.onload = function () {
    trackContainer = document.querySelector('.track-container');
    keypress = document.querySelectorAll('.keypress');
    comboText = document.querySelector('.hit__combo');
    combo_word = document.querySelector('#combo_word');
    initializeNotes();
    setupSpeed();
    // setupChallenge();
    setupStartButton();
    setupKeys();
    setupNoteMiss();
  }
  