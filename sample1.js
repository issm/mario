window.onload = function() {

(function(){
for (var i = 0; i < 1; i++) {
    setTimeout(function () {
        var Mario_or_Luigi = (parseInt(Math.random() * 100) % 2) ? Mario : Luigi;
        var status = (parseInt(Math.random() * 100) % 2) ? 'SUPER' : 'MINI';

        var x = Math.random() * 600;
        var y = 240 + parseInt((Math.random() - .5) * 240);

        var mario = new Mario_or_Luigi({
            x:     x,
            y:     y,
            scale: 2,
            ability: {
                accel: .25,
                bdash: 2,
                jump:  6
            },
            environment: new Mario.Environment({
                gravity: 9.8
            })
            ,status: status
        });

        var controller_mario = new Mario.Controller({
            target: mario
        });

        setTimeout(function() {
            mario.JUMP();
        }, 0);

  }, 0);
}



})();
};

