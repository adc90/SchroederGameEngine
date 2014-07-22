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

	this.getWidth = function(){
		return rect_width;
	};

	this.getHeight = function(){
		return rect_height;
	};

	/* Constructor call */
	this.init();
}

var qt = new QuadTree(0,new Rectangle(0,0,600,600));
qt.insert(1,new Rectangle(50,50,600,500));
var rect = new Rectangle(100,100,443,455);
qt.insert(2,rect);

function test(){
	console.log("The page is loaded");
	console.log(qt.getIndex(rect));
}

window.onload = test;
