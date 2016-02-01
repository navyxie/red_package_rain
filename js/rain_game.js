;(function(){
	var winW = window.innerWidth,winH = window.innerHeight,defaultW = 380,defaultH = 630;
	var totalSecond = 30;
	var score = 0;
	var gravity = 100;
	var gameOver = false;
	// var scaleRate = winW/defaultW;//0.5859375
	// console.log(scaleRate);
	var imageBasePath = '/assets/';
	var score_sprite = ['jinbao','jinbi_game','yuanbao']
	var game = new Phaser.Game(defaultW,winH,Phaser.AUTO,'gameContainer',null,null,true);
	var states = {};
	states.boot = function(){
		this.init = function(){
			if(!game.device.desktop){
				game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
				game.scale.forcePortrait = true;				
			}else{
				game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			}
			//游戏居中
			game.scale.pageAlignHorizontally = true;
			game.scale.pageAlignVertically = true;
			game.scale.refresh();
		}
		this.preload = function(){
			game.stage.backgroundColor = 0xe43134;	
			//loading
			game.load.image('jinbi',imageBasePath+'loading/jinbi.png');
			game.load.image('logo',imageBasePath+'loading/logo.png');
			game.load.image('processing',imageBasePath+'loading/processing.png');
			game.load.image('process_bg',imageBasePath+'loading/process_bg.png');	
		}
		this.create = function(){
			game.state.start('preload');
		}
	}
	states.preload = function(){
		this.preload = function(){		
			//game spritesheet
			game.load.spritesheet('baozha',imageBasePath+'game/baozha.png',68,67);	
			game.load.spritesheet('caishen_sprite',imageBasePath+'game/caishen_sprite.png',83,102);
			game.load.spritesheet('defen_baozha',imageBasePath+'game/defen_baozha.png',52,53);
			//image
			game.load.image('bg',imageBasePath+'game/bg.png');
			game.load.image('bg_bottom',imageBasePath+'game/bg_bottom.png');
			game.load.image('jinbao',imageBasePath+'game/jinbao.png');
			game.load.image('jinbi_game',imageBasePath+'game/jinbi.png');
			game.load.image('score_bg',imageBasePath+'game/score_bg.png');
			game.load.image('ten_lianji',imageBasePath+'game/ten_lianji.png');
			game.load.image('time_bg',imageBasePath+'game/time_bg.png');
			game.load.image('top_icon',imageBasePath+'game/top_icon.png');
			game.load.image('top_icon_right',imageBasePath+'game/top_icon_right.png');
			game.load.image('yuanbao',imageBasePath+'game/yuanbao.png');
			game.load.image('zhadan',imageBasePath+'game/zhadan.png');
			//loading menu
			game.add.sprite(game.width/2,game.height/2-2,'process_bg').anchor.setTo(0.5,0);
			var preloadSprite = game.add.sprite(game.width/2,game.height/2,'processing');
			preloadSprite.anchor.setTo(0.5,0);
			preloadSprite.visible = false;
			var loadText = game.add.text(game.width/2,game.height/2+22,'0%',{font: "bold 16px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"});
			loadText.anchor.setTo(0.5,0);
			var logoSprite = game.add.sprite(game.width/2,game.height-80,'logo');
			logoSprite.anchor.setTo(0.5,0);
			game.load.setPreloadSprite(preloadSprite);
			game.load.onLoadStart.add(function(){},this);
			game.load.onFileComplete.add(function(progress, cacheKey, success, totalLoaded, totalFiles){
				loadText.text = progress + '%('+totalLoaded+'/'+totalFiles+')';
			},this);
			game.load.onLoadComplete.add(function(){
				loadText.destroy();
			},this);
		},
		this.create = function(){	
			this.state.start('play');
		}
	}
	states.play = function(){
		this.create = function(){
			var borderSpace = 45;
			game.add.sprite(0,0,'bg');
			game.add.sprite(0,0,'top_icon');
			game.add.sprite(game.width,0,'top_icon_right').anchor.setTo(1,0);
			game.add.sprite(0,game.height,'bg_bottom').anchor.setTo(0,1);
			game.add.sprite(20,22,'time_bg');
			game.add.sprite(game.width-borderSpace+20,22,'score_bg').anchor.setTo(1,0);
			var caishen = game.add.sprite(borderSpace,70,'caishen_sprite');
			this.caishen = caishen;
			caishen.anchor.setTo(0.5,0);
			caishen.animations.add('fly');
			caishen.play('fly',2,true);
			this.caishen_tween = game.add.tween(caishen).to( { x: game.width-borderSpace }, 3000, Phaser.Easing.Linear.None, true, 0, 10000, true);
			this.updateTimeEvent = game.time.events.loop(1000, this.updateTime, this);
			this.makeBallTimeEvent = game.time.events.loop(1000, this.generateBalls, this);
			this.timeText = game.add.text(96,48,totalSecond+'s',{font: "bold 26px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"});
			this.timeText.anchor.setTo(0.5,0.5);
			this.scoreText = game.add.text(game.width-100,57,score,{font: "bold 22px Arial", fill: "#fef000", boundsAlignH: "center", boundsAlignV: "middle"});
			this.scoreText.anchor.setTo(0.5,0.5);
			this.ballGroup = game.add.group();
			this.ballGroup.enableBody = true;
			//  An explosion pool
			var score_explosions = game.add.group();
			this.score_explosions = score_explosions;
			score_explosions.createMultiple(30, 'defen_baozha');
			score_explosions.forEach(this.setupInvader, this);
			//  An explosion pool
			var zhadan_explosions = game.add.group();
			this.zhadan_explosions = zhadan_explosions;
			zhadan_explosions.createMultiple(30, 'baozha');
			zhadan_explosions.forEach(this.setupInvader, this);
		}
		this.setupInvader = function(invader){
			invader.anchor.x = 0.5;
			invader.anchor.y = 0.5;
			invader.animations.add('kaboom');
		}
		this.updateTime = function(){
			gravity += 8;		
			if(totalSecond-- <= 0){
				this.gameOver();
				return;
			}
			// this.generateBalls();
			this.timeText.text =  totalSecond+'s'
		}
		this.update = function(){
			this.ballGroup.forEachExists(this.checkCollide,this);
			if(gameOver || totalSecond <= 0){
				return;
			}
		}
		this.generateBalls = function(){
			this.makeBall();
			this.ballGroup.setAll('checkWorldBounds',true);
			this.ballGroup.setAll('body.velocity.y', gravity);
		}
		this.makeBall = function(){
			var ball,ballInfo;
			var ballInfos = this.getBallInfo(4);
			for(var i = 0 , len = ballInfos.length ; i < len; i++){
				ballInfo =  ballInfos[i];
				ball = game.add.sprite(ballInfo.x, ballInfo.y, ballInfo.name, 0, this.ballGroup);
				ball.inputEnabled = true;
				ball.anchor.setTo(0.5,0.5);
				if(ballInfo.name !== 'zhadan'){
					ball.events.onInputDown.add(this.addScore,this);
				}else{
					ball.events.onInputDown.add(this.clickZhadan,this);
				}
			}	
		}
		this.getBallInfo = function(len){
			var row = 3;
			var rowHeight = 70;
			var randomHeight = 30;
			if(totalSecond > 22 && totalSecond < 29){
				row = 1;
				randomHeight = 40;
				rowHeight = 80;
			}else if(totalSecond > 10 && totalSecond < 23){
				row = 2;
				randomHeight = 80;
				randomHeight = 90;
			}else if(totalSecond < 11){
				row = 3;
			}
			
			len = len || 1;
			len = Math.min(len,4);
			var space = 5;
			var name = 'zhadan';
			var result = [];
			var x;
			var spaceWidth = game.width/11;
			var xs = [
				spaceWidth,
				spaceWidth*4,
				spaceWidth*7,
				spaceWidth*10
			];
			for(var j = 0 ; j < row ; j++){
				for(var i = 0 ; i < len ; i++){
					var curSprite = parseInt(Math.random()*space);
					if(curSprite < 3){
						name = score_sprite[curSprite];
					}
					//var cur =  Math.floor(Math.random()*xs.length);
					x = xs[i];
					//xs.splice(cur,1);
					result.push({x:x,y:this.caishen.y+this.caishen.height + rowHeight*j - Math.random()*randomHeight,name:name});
				}
			}
					
			return result;
		}
		this.addScore = function(ball){
			this.scoreKabom(ball);
			ball.kill();
			score += 10;
			this.scoreText.text = score;
		}
		this.gameOver = function(){
			gameOver = true;
			this.caishen.animations.stop('fly');
			game.tweens.remove(this.caishen_tween);
			this.ballGroup.forEachExists(this.removeEvent,this);
			game.time.events.remove(this.updateTimeEvent);
			game.time.events.remove(this.makeBallTimeEvent);
		}
		this.clickZhadan = function(ball){
			this.zhadanKabom(ball);
			this.gameOver();
		}
		this.removeEvent = function(ball){
			ball.events.onInputDown.removeAll();
			ball.kill();
		}
		this.checkCollide = function(ball){
			if(ball.y - ball.height/2 > game.height){
				ball.kill();
			}			
		}
		this.scoreKabom = function(alien){
			var explosions = this.score_explosions;
			var explosion = explosions.getFirstExists(false);
			explosion.reset(alien.body.x+alien.width/2, alien.body.y+alien.height/2);
			explosion.play('kaboom', 4, false, true);
		}
		this.zhadanKabom = function(alien){
			var explosions = this.zhadan_explosions;
			var explosion = explosions.getFirstExists(false);
			explosion.reset(alien.body.x+alien.width/2, alien.body.y+alien.height/2);
			explosion.play('kaboom', 4, false, true);
		}
	}
	game.state.add('boot',states.boot);
	game.state.add('preload',states.preload);
	game.state.add('play',states.play);
	game.state.start('boot');
})();