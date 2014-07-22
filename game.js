//------------------------------------------------------------------------------------------------------
// Game.js
// Authors: Aaron Clevenger
// Description: Game engine written in plain JavaScript, some jQuery to do menial stuff.
// Some of the code was adapted from examples, they are noted bellow
// [1] http://stackoverflow.com/questions/11349613/html5-canvas-not-working-in-external-javascript-file
// Notes: wrap arguments in arrays to make them easier to read
//-------------------------------------------------------------------------------------------------------

//document.addEventListener('DOMContentLoaded', domloaded, false);
var canvas;

$(document).ready(function() 
{
    canvas = document.getElementById("game_screen");
    var gameEngine = new GameEngine();
    
    $("#test").css("color","red");
    gameEngine.startGame();
    Test();
});

var max_time = 0;
//var cinterval;
 
function countdown_timer(){
  // decrease timer
  max_time++;
  document.getElementById('test').innerHTML = max_time;
  if(max_time === 600){
    clearInterval(cinterval);
  }
}

var GameEngine = (function()
{
    var engine = function()
    {
        var keyListener;
        var entityManager;
        var entityList;
        var width = canvas.width;
        var height = canvas.height;
        engine.context = canvas.getContext('2d');
        engine.score = 0;
        engine.bulletNum = 0;
        GameEngine.context.font = "15pt Arial";

        /* Declare the drawable items that should be drawn on the screen,
         * you can not create entities dynamicly. */
        var entities = [{width: 75, height: 20, xpos: width/2, ypos: 450, image: "charA.png", type: "MainPlayer", drawn: true},
                        {width: 75, height: 20, xpos: 100, ypos: 450, image: "charD.png", type: "ProjectileEntity", drawn:false}];
                
                
        var paintBackground = function()
        {
            setBackground();
            GameEngine.context.fillRect(0, 0, width, height);
        };

        //-------------------------------------------------
        // Loop functions declared here
        //-------------------------------------------------

        //Start the game
        this.startGame = function()
        {
            setBackground();
            this.startResourceManager();
        };

        //Updates movements
        var updateGame = function(entity)
        {
            if (entity.ypos < 0)
            {
                entity.setDrawn(false);
                GameEngine.bulletNum = 0;
            }
        };

        //Draw the game
        var drawGame = function(entity)
        {
            entity.drawEntity();
        };


        //Main game loop
        this.startGameLoop = function()
        {
            var ONE_FRAME_TIME = 1000 / 60;		//60FPS
            var mainloop = function()
            {
                entityList = entityManager.getEntities();
                GameEngine.context.clearRect(0, 0, width, height);
                paintBackground();
                GameEngine.context.fillStyle = "#fff";
                GameEngine.context.fillText(max_time,10,25);
                GameEngine.context.fillText(GameEngine.score,700,25);
                for (var i = 0; i < entityList.length; i++)
                {
                    updateGame(entityList[i]);
                    drawGame(entityList[i]);

                    if (entityList.length > 1) {
                        for (var j = i + 1; j < entityList.length; j++)
                        {
                            if (checkCollision(entityList[i], entityList[j])) {
                                entityList[i].onHit();
                                entityList[j].onHit();
                            }
                        }
                    }

                }
            };
            setInterval(mainloop, ONE_FRAME_TIME);
        };
        //-------------------------------------------------

        //-------------------------------------------------
        // Set up resource management
        //-------------------------------------------------
        this.startResourceManager = function()
        {
            console.log("//-----------------------------------------");
            console.log("// Resouce manager has been started");
            console.log("//-----------------------------------------");
            keyListener = new KeyListener();
            entityManager = new EntityManager();
            //Append the list
            var enemyGroup = new EnemyGroup(50,30,60,30,5,11);
            enemyGroup = enemyGroup.getEnemyGroup();
            entities = entities.concat(enemyGroup);            

            entityManager.setEntities(entities);
            if (entityManager.playerSet === true) {
                keyListener.setPlayer(entityManager.getMainPlayer());
            }

            this.startGameLoop();
            cinterval = setInterval('countdown_timer()', 1000);
        };
        //-------------------------------------------------
    };
    return engine;
})();

// Function to check for collision
function checkCollision(entA, entB)
{
    var colBoxA = entA.colBox;
    var colBoxB = entB.colBox;
    return !(colBoxB.left > colBoxA.right ||
            colBoxB.right < colBoxA.left ||
            colBoxB.top > colBoxA.bottom ||
            colBoxB.bottom < colBoxA.top);
}

// Sets the background gradient
function setBackground()
{
    var gradient = GameEngine.context.createLinearGradient(150.000, 0.000, 150.000, 500.000);
    var stops = [0.000, 0.720, 0.796, 1.000];
    var colors = ["#AAAAFF", "#AAAAFF", "#7F7F00", "#7F7F00"];
    for (var i = 0; i < stops.length; i++)
    {
        gradient.addColorStop(stops[i], colors[i]);
    }
    GameEngine.context.fillStyle = gradient;
}


//-------------------------------------------------
// Entity classes for things drawn on the screen
//-------------------------------------------------

//Base class for all objects drawn on screen
var Entity = (function()
{
    //Constructor
    var ent = function()
    {
    };
    ent.prototype = {
        xpos: 0,
        ypos: 0,
        width: 25,
        height: 50,
        image: "",
        drawn: false,
        type: "Entity",
        entName: "",
        setDrawn: function(toggle)
        {
            this.drawn = toggle;
        },
        getDrawn: function()
        {
            return this.drawn;
        },
        drawEntity: function()
        {
            GameEngine.context.drawImage(this.image, this.xpos, this.ypos, this.width, this.height);
        }};
    return ent;
})();

//Main player class that is hooked into the key listener 
var MainPlayer = (function()
{
    //Constructor
    var mainPlayer = function(image, xpos, ypos, width, height, drawn)
    {
        this.constructor.super.call(this);
        this.speed = 5;
        this.xdir = 0;
        this.ydir = 0;
        this.xpos = xpos;
        this.ypos = ypos;
        this.image = image;
        this.type = "MainPlayer";
        this.width = width;
        this.height = height;
        this.drawn = drawn;
        this.colBox = new CollisionBox(this.xpos, this.ypos, this.width, this.height);

        this.onHit = function()
        {
            console.log("Hit");
        };

        this.fire = function()
        {
                if(GameEngine.bulletNum === 1){
                    return;
                }
                else{
                    var muzzleX = this.xpos + (this.width / 2);
                    var muzzleY = this.ypos - 8;
                    EntityManager.createEntity({width: 2, height: 5, image: "charA.png", xpos: muzzleX, ypos: muzzleY, type: "ProjectileEntity", drawn: true});
                    GameEngine.bulletNum = 1;
                }
        };

        this.setXDir = function(dx)
        {
            this.xdir = dx;
        };
        this.setYDir = function(dy)
        {
            this.ydir = dy;
        };
        this.moveDirection = function()
        {
            this.xpos += this.xdir;
            this.ypos += this.ydir;
        };
        //Override the draw entity method so it responds to key input
        this.drawEntity = function()
        {
            this.moveDirection();
            this.colBox.updateColBox(this.xpos, this.ypos, this.width, this.height);
            GameEngine.context.drawImage(this.image, this.xpos, this.ypos, this.width, this.height);
        };
    };
    inherit(mainPlayer, Entity);
    return mainPlayer;
})();

//Class for enemies 
var EnemyEntity = (function()
{
    var enemy = function(image, xpos, ypos, width, height, drawn)
    {
        this.constructor.super.call(this);
        this.xdir = 0;
        this.ydir = 0;
        this.xpos = xpos;
        this.ypos = ypos;
        this.image = image;
        this.type = "EnemyEntity";
        this.width = width;
        this.height = height;
        this.drawn = drawn;
        this.colBox = new CollisionBox(this.xpos, this.ypos, this.width, this.height);

        this.onHit = function()
        {
            this.drawn = false;
            GameEngine.score++;
            GameEngine.bulletNum = 0;
        };
        this.setXDir = function(dx)
        {
            this.xdir = dx;
        };
        this.setYDir = function(dy)
        {
            this.ydir = dy;
        };
        this.moveDirection = function()
        {
            this.xpos += this.xdir;
            this.ypos += this.ydir;
        };
        this.drawEntity = function()
        {
            this.moveDirection();
            this.colBox.updateColBox(this.xpos, this.ypos, this.width, this.height);
            GameEngine.context.drawImage(this.image, this.xpos, this.ypos, this.width, this.height);
        };

    };
    inherit(enemy, Entity);
    return enemy;
})();

//Class for projectiles
var ProjectileEntity = (function()
{
    var projectile = function(image, xpos, ypos, width, height, drawn)
    {
        this.constructor.super.call(this);
        this.xdir = 0;
        this.ydir = -5;
        this.xpos = xpos;
        this.ypos = ypos;
        this.image = image;
        this.width = width;
        this.height = height;
        this.drawn = drawn;
        this.type = "ProjectileEntity";
        this.colBox = new CollisionBox(this.xpos, this.ypos, this.width, this.height);

        this.onHit = function()
        {
            this.drawn = false;
        };

        this.setXDir = function(dx)
        {
            this.xdir = dx;
        };
        this.setYDir = function(dy)
        {
            this.ydir = dy;
        };
        this.moveDirection = function()
        {
            this.xpos += this.xdir;
            this.ypos += this.ydir;
        };
        this.drawEntity = function()
        {
            this.moveDirection();
            this.colBox.updateColBox(this.xpos, this.ypos, this.width, this.height);
            GameEngine.context.drawImage(this.image, this.xpos, this.ypos, this.width, this.height);
        };
    };
    inherit(projectile, Entity);
    return projectile;
})();

var EnemyGroup = (function()
{
    var enemyGroup = function(xpos,ypos,xspace,yspace,numRow,numCol)
    {
        this.xpos = xpos;
        this.ypos = ypos;
        this.xspace = xspace;
        this.yspace = yspace;
        this.numRow = numRow;
        this.numCol = numCol;
        this.type = "EnemyGroup";
        this.ydir = 0;
        this.xdir = 2;
        
        this.setXDir = function(dx)
        {
            this.xdir = dx;
        };
        this.setYDir = function(dy)
        {
            this.ydir = dy;
        };
        this.moveDirection = function()
        {
            this.xpos += this.xdir;
            this.ypos += this.ydir;
        };
        
        //Enemy list
        this.enemyList = new Array();
       
        this.count = 0;
        var x = this.xpos;
        this.createGroup = function()
        {
            for(var i = 0; i < this.numRow; i++)         //Rows are y
            {
                for (var j = 0; j < this.numCol; j++)    //Columns are x
                {
                    this.enemyList[this.count] = {width:25, height: 25, xpos: this.xpos, ypos: this.ypos, image: "charE.png", type: "EnemyEntity", drawn: true};
                    this.xpos += this.xspace;
                    this.count++;
                }
                this.xpos = x;
                this.ypos += this.yspace;
            }
        };

        
        this.getEnemyGroup = function()
        {
            return this.enemyList;
        };        
        
        this.createGroup();
        
    };
    return enemyGroup;
})();

//Collision box responsible for tracking entities
//hit box, uses simple rectangle hit box
var CollisionBox = (function()
{
    var colBox = function(xpos, ypos, width, height)
    {
        this.left = xpos;
        this.top = ypos;
        this.right = xpos + width;
        this.bottom = ypos + height;

        this.updateColBox = function(xpos, ypos, width, height)
        {
            this.left = xpos;
            this.top = ypos;
            this.right = xpos + width;
            this.bottom = ypos + height;
        };
    };
    //Moving entities will need to update their collision boxes
    return colBox;
})();
//-------------------------------------------------

//-------------------------------------------------
//Entity factory that returns the correct entity
//-------------------------------------------------
var EntityFactory = (function()
{
    var entFactory = function()
    {
        var entity;

        this.createEntity = function(ent)
        {
            if (ent.type === "MainPlayer")
            {
                entity = new MainPlayer(ent.image, ent.xpos, ent.ypos, ent.width, ent.height, ent.drawn);
            }
            else if (ent.type === "EnemyEntity")
            {
                entity = new EnemyEntity(ent.image, ent.xpos, ent.ypos, ent.width, ent.height, ent.drawn);
            }
            else if (ent.type === "ProjectileEntity")
            {
                entity = new ProjectileEntity(ent.image, ent.xpos, ent.ypos, ent.width, ent.height, ent.drawn);
            }
            return entity;
        };
    };
    return entFactory;
})();
//-------------------------------------------------

//-------------------------------------------------
// Key listener class
//-------------------------------------------------
var KeyListener = (function()
{
    //Constructor
    var keyObj = function()
    {
        this.char;

        //Define key functions
        var keyDown = function(evt) {
            evt = evt || window.event;
            setDirection(evt.keyCode);
        };
        var keyUp = function(evt) {
            evt = evt || window.event;
            haltDirection(evt.keyCode);
        };

        var setKeyListener = function() {
            canvas.onkeydown = keyDown;
            canvas.onkeyup = keyUp;
            console.log("// Key listener is set");
        };

        var setDirection = function(dir)
        {
            if (dir === 37) {               //Left arrow key
                char.setXDir(-char.speed);
            } else if (dir === 38) {         //Up arrow key
                return;
            } else if (dir === 39) {        //Right arrow key
                char.setXDir(char.speed);
            } else if (dir === 32) {        //Space bar
                char.fire();
            }
        };

        var haltDirection = function(dir)
        {
            if (dir === 37) {               //Left arrow key
                char.setXDir(0);
            } else if (dir === 38) {        //Up arrow key
                return;
            } else if (dir === 39) {        //Right arrow key
                char.setXDir(0);
            } else if (dir === 32) {        //Space bar
                return;
            }
        };

        this.setPlayer = function(mainChar) {
            console.log("// Main player bound to key listener");
            setKeyListener();
            char = mainChar;
        };

        //Alert that the keylistner has been initilized
        console.log("// Key Listener has been set up");
    };
    return keyObj;
})();
//-------------------------------------------------


//------------------------------------------------------------------------
// Entity manager, makes sure that all resources are initilized before the 
// engine is called no dynamic loading of entities, if you need a new
// entity delcare it first and draw it later.
//------------------------------------------------------------------------
var EntityManager = (function()
{
    //Constructor
    var entManager = function()
    {
        //Main player entity
        this.mainPlayer;
        this.playerSet = false;

        //Create a new entity factory
        this.entityFactory = new EntityFactory();

        //Create list for the EntityManager to process.
        this.entityList;
        this.imageResources;
        this.numImageResources = 0;

        //Refence to this
        var ref = this;

        //Function for creating new entities
        entManager.createEntity = function(ent)
        {
            var temp = ent;
            var index = imageInPool(temp.image, ref.imageResources);
            temp.image = ref.imageResources[index];
            ref.entityList.push(ref.entityFactory.createEntity(temp));
        };

        //-------------------------------------------------
        // Getter and setter functions for entities
        //-------------------------------------------------
        this.setEntities = function(ents)
        {
            console.log("// Entity Manager started");
            this.entityList = ents;
            this.setImageResources(ents);
            
            for (var i = 0; i < this.entityList.length; i++)
            {
                this.entityList[i] = this.entityFactory.createEntity(this.entityList[i]);
                if (this.entityList[i].type === "MainPlayer")
                {
                    this.setMainPlayer(this.entityList[i]);
                    this.playerSet = true;
                }
                var index = imageInPool(this.entityList[i].image, this.imageResources);
                this.entityList[i].image = this.imageResources[index];
            }
        };

        this.getEntities = function()
        {
            for (var i = 0; i < this.entityList.length; i++)
            {
                if (this.entityList[i].drawn === false)
                {
                    var index = this.entityList.indexOf(this.entityList[i]);
                    if (index > -1)
                    {
                        this.entityList.splice(index, 1);
                    }
                }
            }
            return this.entityList;
        };
        //-------------------------------------------------

        //-------------------------------------------------
        // Makes sure that images are loaded before the
        // game starts, only load the images into the 
        // resouce list once.
        //-------------------------------------------------
        this.setImageResources = function(ents)
        {
            this.imageResources = new Array();

            for (var i = 0; i < this.entityList.length; i++)
            {
                var num = $.inArray(this.entityList[i].image, this.imageResources);
                if (num === -1) {
                    this.imageResources[i] = this.entityList[i].image;
                }
                else {
                    continue;
                }
            }
            for (var j = 0; j < this.imageResources.length; j++)
            {
                var temp = this.imageResources[j];
                this.imageResources[j] = new Image();
                this.imageResources[j].src = temp;
                this.imageResources[j].onload = this.incLoaded();
            }
        };
        //---------------------------------------------------

        //Private function only called from inside this class
        this.incLoaded = function()
        {
            this.numImageResources++;

            if (this.numImageResources === this.imageResources.length)
            {
                console.log("//     *All image resources are loaded");
            }
        };

        //-------------------------------------------------
        // Getter and setter functions for the main player
        //-------------------------------------------------
        this.setMainPlayer = function(player) {
            this.mainPlayer = player;
        };

        this.getMainPlayer = function() {
            return this.mainPlayer;
        };
        //-------------------------------------------------
        //
        //Alert when the entity manager is created
        console.log("// Entity manager has been set up");
    };
    return entManager;
})();
//-------------------------------------------------

function inherit(cls, superCls)
{
    var construct = function() {
    };
    construct.prototype = superCls.prototype;
    cls.prototype = new construct;
    cls.prototype.constructor = cls;
    cls.super = superCls;
}

function getImageName(image)
{
    var extResource = image.src.lastIndexOf("/") + 1;
    var name = image.src.substr(extResource);

    return name;
}

function imageInPool(imageName, imageList)
{
    var index = -1;
    for (var i = 0; i < imageList.length; i++)
    {
        if (imageName === getImageName(imageList[i]))
        {
            index = i;
            break;
        }
    }
    return index;
}

/*
* Credit for the QuadTree idea goes to Steven Lambert from his article:
* http://gamedevelopment.tutsplus.com/tutorials/quick-tip-use-quadtrees-to-detect-likely-collisions-in-2d-space--gamedev-374
*/

function QuadTree(pLevel, pBounds)
{
	var MAX_OBJECTS = 10;
	var MAX_LEVELS = 5;

	var level;
	var objects;
	var bounds;
	var nodes;

	/* Stuff set by the 'constructor' */
	this.init = function(){
		level = pLevel;
		objects = new Array();
		bounds = pBounds;
		nodes = new Array(4);
	};

	/* Clears the quadtree */
	this.clear = function(){
		objects.clear();

		for(var i = 0; i < nodes.length; i++){
			if(nodes[i] != null){
				nodes[i].clear();
				nodes[i] = null;
			}
		}
	};

	/* Split the quadtree */
	this.split = function(){
		var subWidth = (bounds.getWidth() / 2);
		var subHeight = (bounds.getHeight() / 2);
		var x = bounds.getX();
		var y = bounds.getY();

		nodes[0] = new QuadTree(level + 1, new Rectangle(x + subWidth, y, subWidth, subHeight));
		nodes[1] = new QuadTree(level + 1, new Rectangle(x, y, subWidth, subHeight));
		nodes[2] = new QuadTree(level + 1, new Rectangle(x, y + subHeight, subWidth, subHeight));
		nodes[3] = new QuadTree(level + 1, new Rectangle(x + subWidth, y + subHeight, subWidth, subHeight)); 
	};

	/* Get the index of the parent node */
	this.getIndex = function(pRect){
		var index = -1;
		var verticalMidpoint = bounds.getX() + (bounds.getWidth() / 2);
		var horizontalMidpoint = bounds.getY() + (bounds.getHeight() / 2);

		var topQuad = (pRect.getY() < horizontalMidpoint && pRect.getHeight() < horizontalMidpoint);
		var bottomQuad = (pRect.getY() > horizontalMidpoint);

		if(pRect.getX() < verticalMidpoint && pRect.getX() + pRect.getWidth() < verticalMidpoint){
			if(topQuad){
				index = 1;
			}else if(bottomQuad){
				index = 2;
			}
		}else if(pRect.getX() > verticalMidpoint){
			if(topQuad){
				index = 0;
			}else if(bottomQuad){
				index = 3;
			}
		}
		return index;
	};

	/* Insert objects into the QuadTree */
	this.insert = function(pRect){
		if(nodes[0] != null){
			var index = getIndex(pRect);
			if(index != -1){
				nodes[index].insert(pRect);
				return;
			}
		}
		objects.push(pRect);
		if(objects.length > MAX_OBJECTS && level < MAX_LEVELS){
			if(nodes[0] == null){
				this.split();	//this refers to this.insert() ?
			}
			var i = 0;
			while(i < objects.length){
				var index = getIndex(objects[i]);
				if(index != -1){
					nodes[index].insert(objects.splice(i,1)[0]);
				}
				else{
					i++;
				}
			}
		}
	};

	/* Return all objects */
	this.retrieve = function(returnObjects, pRect){
		var index = getIndex(pRect);
		if(index != -1 && nodes[0] != null){
			nodes[index].retrieve(returnObjects,pRect);
		}
		returnObjects.push(objects);

		return returnObjects;
	};

	/* Constructor call */
	this.init();
}

function Rectangle(x, y, width, height){

	/* Private data members */
	var rect_x;
	var rect_y;
	var rect_width;
	var rect_height;

	/* Constructor */
	this.init = function(){
		rect_x = x;
		rect_y = y;
		rect_width = width;
		rect_height = height;
	};

	/* Getter functions */
	this.getX = function(){
		return rect_x;
	};

	this.getY = function(){
		return rect_y;
	};

	thisWidth.get = function(){
		return rect_width;
	};

	this.getHeight = function(){
		return rect_height;
	};

	/* Constructor call */
	this.init();
}
