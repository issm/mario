window.onload = function() {

(function(){
for( var i = 0; i < 1; i++ ) {
  setTimeout( function() {

  var y = 240 + parseInt( ( Math.random() - .5 ) * 240 );

  var mario = new Mario({
    x:           Math.random() * 400,
    y:           y,
    scale: 2,
    ability: {
      accel: .25,
      bdash: 2,
      jump:  6 
    },
    environment: new Mario.Environment({
      gravity: 9.8
    })
    ,status: 'SUPER'
  });

  var luigi = new Mario({
    x:           Math.random() * 400,
    y:           y,
    scale: 2,
    ability: {
      accel: .15 + ( Math.random() - .5 ) * .025,
      bdash: 2.5 + ( Math.random() - .5 ) * 1,
      jump:  7   + ( Math.random() - .5 ) * 2
    },
    environment: new Mario.Environment({
      gravity: 8.8
    }),
    type:        'LUIGI'
    //,status: 'SUPER'
  });

  var controller_mario = new Mario.Controller({
    mario: mario
  });
  var controller_luigi = new Mario.Controller({
    mario: luigi
  });

  setTimeout( function() {
    mario.JUMP();
    luigi.JUMP();
  }, 0 );

  }, 0 );


/*
  window.mario2 = new Mario({
    x: 200,
    y: 200,
    ability: {
      accel: .5
      
    }
  });
  mario2.WALK();

  var toggle = false;
  var timer = setInterval( function() {
    if( ! toggle  &&  mario2.__X >= 600 ) {
      toggle = true;
      mario2.update_velocity( -1 );
      //clearInterval( timer );
    }
    else if( toggle  &&  mario2.__X <= 100 ) {
      toggle = false;
      mario2.update_velocity( 1 );
    }
    else {
      mario2.update_velocity( toggle ? -1 : 1 );
    }
  }, 20 );

*/



}



})();
};

