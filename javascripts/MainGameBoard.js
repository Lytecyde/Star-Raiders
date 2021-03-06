
/*****************************************************************************
The MIT License (MIT)

Copyright (c) 2014 Andi Smithers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*****************************************************************************/

// conceptualized and written by andi smithers

const typeBase = 0;
const typePatrol = 1;
const typeGroup = 2;
const typeFleet = 3;

const dead = -1;
const base = 0;
const fighter = 1;
const cruiser = 2;
const basestar = 3;

const novice = 0;
const pilot = 1;
const warrior = 2;
const commander = 3;

const DeadState = 0;
const AliveState = 1;
const UnknownState = 2;

var gameDifficulty;

// creates a piece
function BoardPiece(x, y, type)
{
  this.init(x, y, type);
}

// initializer
BoardPiece.prototype.init = function(fx, fy, type)
{
  // type 0 = base
  // type 1 = patrol
  // type 2 = group
  // type 3 = fleet

  
  // status = 0 dead
  // status = 1 alive
  this.type = type;
  this.laststate = 0;
  this.lastknown = {x:fx, y:fy};

  this.location = {x:fx, y:fy};
  this.status   = UnknownState;
  
  this.moveRate = type==3 ? 8 : type;
  this.nextMove = this.moveRate;
  
  this.numTargets = type+1;
  this.targets = [];
  this.targets[0] = type; // ensures a base star 
  // ship layout
  for (var i=1; i<this.numTargets; i++)
  {
    this.targets[i] = Math.min(Math.floor(Math.random()*gameDifficulty*0.2+Math.random()*i)+1, basestar);
  }
}

BoardPiece.prototype.killTarget = function(shipType)
{
  var j=-1;
  for (var i=0; i<this.numTargets; i++)
  {
    if (this.targets[i]==shipType)
    {
      j=i;
    }
  }

  if (j!=-1)
  {
    if (shipType==base)
    {
      startText("Starbase destroyed", border.x, 150);
    }
    this.targets.splice(j,1);
    this.numTargets--;
    if (this.numTargets==0)
    {
      this.status = DeadState; // bye bye
      startText("Sector clear", border.x, 150); 
      UpdateBaseAttack(lastCycle);
    }
  }
  
}

// render pieces
BoardPiece.prototype.render = function(x, y, radius)
{
   var trailRad2 = radius*radius*0.25;
   var leadRad2 = radius*radius*4;

   var pos = this.screen(this.lastknown.x, this.lastknown.y);
   var dx = pos.x - x;
   var dy = pos.y - y;
   var distance2 = dx*dx+dy*dy;

   var fade=1;
  
	if (distance2<leadRad2) // update lastknow
   {
     fade = (distance2 - trailRad2) / (leadRad2-trailRad2);
     if (fade>0  && this.laststate!=0)
     {
        this.drawitem(pos, fade);
     }
   }
   else if (this.laststate!=0)
   {
      this.drawitem(pos, 1);
   }
  
   var pos2 = this.screen(this.location.x, this.location.y);
   var dx2 = pos2.x-x;
   var dy2 = pos2.y-y;
   var distance22 = dx2*dx2+dy2*dy2;
  
    if (distance22<leadRad2 && this.status!=DeadState) // update lastkno
    {
      fade = ((distance22 - trailRad2) / (leadRad2-trailRad2))+1.0;
      this.drawitem(pos2, fade);  
    }  
    else if (this.status == AliveState)
    {
      this.drawitem(pos2, fade);  
    }

}


// update to known location
BoardPiece.prototype.updateKnowns = function()
{
   if(this.status==UnknownState) this.status=AliveState;
  
   this.lastknown.x = this.location.x;
   this.lastknown.y = this.location.y;
   this.laststate   = this.status;
}

// game piece movement logic - pretty rough randomizer

BoardPiece.prototype.move = function(gameCycle)
{
   this.updateKnowns();

   // dont need to do anything for dead pieces (status 2 was bring the piece back alive)
   if (this.status == DeadState) return;
  
   // scale game cycle time (radar beats every 10s)
   aiCycle = Math.floor(gameCycle/cycleScalar);

   if (this.nextMove<=aiCycle && this.type > 0) // new position except bases
   {
      // check if we have the player ship here
      if (shipLocation.x == this.location.x && shipLocation.y == this.location.y) return;

      var x, y;
      var target = boardPieces[targetBase].location;
      // bee-line
      var dx = target.x - this.location.x;
      var dy = target.y - this.location.y;
      do
      {
        x = Math.max(Math.min(dx, 1), -1) + this.location.x;
        y = Math.max(Math.min(dy, 1), -1) + this.location.y;
      } while( x<0 || y<0 || x>=galaxyMapSize.x || y>=galaxyMapSize.y);

      var p = GetBoardPiece(x, y);
      if (p>=0 && isAlive(p)) 
      {
          if (dx==0) x = Math.floor(Math.random()*2)*2-1 + this.location.x;
          else y = Math.floor(Math.random()*2)*2-1 + this.location.y;
          p = GetBoardPiece(x, y);
          // off board or occupied
          if (x<0 || y<0 || x>=galaxyMapSize.x || y>=galaxyMapSize.y) return;
          if (p>=0 && isAlive(p)) return;
      }

     // update movement time
     this.nextMove += this.moveRate;
     
     this.location.x = x;
     this.location.y = y;
     this.status = UnknownState;

     // lets check again see if ships arrived
     if (shipLocation.x == this.location.x && shipLocation.y == this.location.y)
     {
       SetupNMEs(this);
     }
   }
}

// help functoin to convert from map to screen space
BoardPiece.prototype.screen = function(x, y)
{
  return {x:x*mapScale.x+mapScale.x*0.5+border.x+mapCentreX, y:y*mapScale.y+mapScale.y*0.5+border.y+mapCentreY};
}


// DRAW Board piece item with label text
BoardPiece.prototype.drawitem = function( pos, fading)
{
  var ascii = ["starbase", "patrol", "group", "fleet"];

	var light = (fading-1)*255;
   light = Math.floor(Math.max(Math.min(light, 255), 0));
  
  font = fontsize + (((fading-1.5)*40));
  if (this.status != UnknownState || fading <=1.5) font = fontsize;
  font*=0.75;
  context.globalAlpha = fading>1 ? 1.0: fading;
  context.font = font + 'pt Calibri';
  context.fillStyle = 'rgb('+light+',255,'+light+')';
  context.textAlign = "center";

  context.fillText(ascii[this.type], pos.x, pos.y+font*1.5);  
  
  pos.y-=font;
  
  switch(this.type)
    {
      case 0: // base
        context.beginPath();
        context.arc(pos.x, pos.y, font, 0, Math.PI, true);
        context.moveTo(pos.x+font, pos.y);
        context.quadraticCurveTo(pos.x, pos.y+font*0.75, pos.x-font, pos.y);
        context.fill();
        context.strokeStyle='#80ff80';
        context.stroke();
        break;
      case 1:  // patrol fighter
        context.beginPath();
        context.arc(pos.x, pos.y, font*0.75, 0, Math.PI*2, false);
        context.fill();
        context.moveTo(pos.x-font, pos.y-font);
        context.lineTo(pos.x-font, pos.y+font);
        context.moveTo(pos.x+font, pos.y-font);
        context.lineTo(pos.x+font, pos.y+font);
        context.strokeStyle='#80ff80';
        context.stroke();
        break;
      case 2: // group cruiser
        context.beginPath();
        context.moveTo(pos.x-font, pos.y);
        context.lineTo(pos.x-font/2, pos.y-font/2);
        context.lineTo(pos.x+font*2, pos.y);
        context.lineTo(pos.x-font/2, pos.y+font/2);
        context.closePath();
        context.fill();
        context.lineTo(pos.x+font*2, pos.y);
        context.strokeStyle='#80ff80';
        context.stroke();
        context.beginPath();
        context.arc(pos.x-font*1.5, pos.y-font*0.9, font*0.25, 0, Math.PI*2, false);
        context.arc(pos.x-font*2, pos.y+font*0.75, font*0.25, 0, Math.PI*2, false);
        context.fill();
        break;
        
      case 3: // fleet / basestar
        context.beginPath();
        context.moveTo(pos.x-font, pos.y-font/2);
        context.quadraticCurveTo(pos.x, pos.y-font, pos.x+font, pos.y-font/2);
        context.lineTo(pos.x-font, pos.y+font/2);
        context.quadraticCurveTo(pos.x, pos.y+font, pos.x+font, pos.y+font/2);
        context.closePath();
        context.fill();
        context.strokeStyle='#80ff80';
        context.stroke();
        break;
    }

}

function CountHostiles(loc)
{
  var count = 0;
    for (var i=-1; i<2; i++)
    {
      for (var j=-1; j<2; j++)
        {
          var p = GetBoardPiece(loc.x+i, loc.y+j, 0);
          if (p>=0 && boardPieces[p].status!=DeadState && boardPieces[p].type!=base) count++;
        }
    }
  
  return count;
}


function BoardSetup(difficulty)
{
  // set board layout on diffuculty
  var numPieces = 3+difficulty;
  gameDifficulty = difficulty;

  // clear board
  targetBase = 0;
  boardPieces = [];
  
  var x, y;
  var edge = 1;
  for (var i =0; i<4; i++)  // types
  {
    for (var j=0; j<numPieces; j++)  // counts
    {

      do
      {
        x = Math.floor(Math.random() * (galaxyMapSize.x-edge*2))+edge;
        y = Math.floor(Math.random() * (galaxyMapSize.y-edge*2))+edge;
        var isShip = (shipLocation.x == x) && (shipLocation.y == y);
        var p = GetBoardPiece(x, y);
      } while(p>=0 || isShip);

      boardPieces.push(new BoardPiece(x, y, i));
    }
    edge = 0;
  }
}


// board pieces 
function GetBoardPiece(x, y, useKnown)
{
  xi = Math.floor(x);
  yi = Math.floor(y);

  if (useKnown)
  {
      for (var i=0; i<boardPieces.length; i++)
      {
        if (boardPieces[i].lastknown.x == xi && boardPieces[i].lastknown.y==yi && boardPieces[i].status!=DeadState) return i;
      }      
  }
  else
  {
      for (var i=0; i<boardPieces.length; i++)
      {
        if (boardPieces[i].location.x == xi && boardPieces[i].location.y==yi && boardPieces[i].status!=DeadState) return i;
      }      
  }
  return -1;
}

function isAlive(index)
{
  if (index==-1) return false;
  return boardPieces[index].status != DeadState;
}

function GetBoardPieceScreen(sx, sy, lastKnown)
{
  x = Math.min(Math.max(sx-border.x, 0), mapScale.x*16) / mapScale.x;
  y = Math.min(Math.max(sy-border.y, 0), mapScale.y*16) / mapScale.y;
  
  return GetBoardPiece(x, y, lastKnown);
}

function SetShipLocation(x, y)
{
  shipLocation.x = Math.floor(x);
  shipLocation.y = Math.floor(y);
  shipPosition.x = x;
  shipPosition.y = y;
}

function GetPieceAtShipLocation()
{
  var index = GetBoardPiece(shipLocation.x, shipLocation.y, false);

  return index<0 ? null : boardPieces[index];
}

function SetWarpPoint(x, y, lock)
{
  if (warpLocked == true && lock == false) return;
  warpLocked = lock;
  
  // convert mouse to board
  warpLocation.x = Math.min(Math.max(x-border.x, 0), mapScale.x*16) / mapScale.x;
  warpLocation.y = Math.min(Math.max(y-border.y, 0), mapScale.y*16) / mapScale.y;
  
  warpAnim = 0;
  if (warpLocked)
      startText("Hyperspace Destination Set", border.x, 150);

}

function ClearWarpPoint()
{
  if (warpLocked==true)
  {
    startText("Cleared Hyperspace Destination", border.x, 150);
  }
  warpLocked = false;

}

// many thanks to http://www.sonic.net/~nbs/star-raiders/docs/v.html 
var distanceTable =[100,130,160,200,230,500,700,800,900,1200,1250,1300,1350,1400,1550,1700,1840,2000,2080,2160,2230,2320,2410, 2500,9999];

function ShipCalculateWarpEnergy(sx, sy)
{
   // convert sx and sy into board-coords
  var x = Math.min(Math.max(sx-border.x, 0), mapScale.x*16) / mapScale.x;
  var y = Math.min(Math.max(sy-border.y, 0), mapScale.y*16) / mapScale.y;
    
  var dx = shipPosition.x - x;
  var dy = shipPosition.y - y;

  // location
  var distance = Math.sqrt(dx*dx+dy*dy);

  var di = Math.floor(distance);
  if (di>23) di=23;

  var energy = distanceTable[di];
  energy+= (distanceTable[di+1]-energy) * (distance-di);
  
  return Math.floor(energy);
}



function UpdateBoard()
{
  var d = new Date();
  var currentTime = d.getTime();
  var gameCycle = Math.floor((currentTime - gameStart)/10000);
  if (gameCycle!=lastCycle)
  {
    for (var b=0; b<boardPieces.length; b++)
    {
      boardPieces[b].move(gameCycle);
    }
    shipPing.x = shipPosition.x;
    shipPing.y = shipPosition.y;
  

    lastCycle = gameCycle;
  }

  UpdateBaseAttack(gameCycle);

  // did we vanquish
  if (isAnyAlive()== false)
  {
    EndGame(allDead);
  }
}

function isAnyAlive()
{
  for (var b=0; b<boardPieces.length; b++)
  {
    if (boardPieces[b].type!=typeBase && boardPieces[b].status!=DeadState) return true;
  }
  return false;
} 

function UpdateBaseAttack(gameCycle)
{
    // check starbase health and trigger destruction 
   var base = boardPieces[targetBase];
   if (base.status == DeadState)
   {
      // opps we killed it, how 'strategic' cpu needs new target
      targetBase++;
   }

   var count = CountHostiles(base.location);
   if (count>=4) // trigger kaboom
   {
     if (base.nextMove==0)
     { 
        base.nextMove = gameCycle + 6;
        startText("Starbase under attack", border.x, 150);
     }
     if (base.nextMove<=gameCycle)
     { 
       targetBase++;
       base.status = DeadState;
       startText("Starbase destroyed", border.x, 150);
       var patrol = new BoardPiece(base.location.x, base.location.y, typePatrol)
       boardPieces.push(patrol);
       statistics.bases++;
       // is ship in same sector
       if (shipLocation.x == base.location.x && shipLocation.y == base.location.y)
       {
         DestroyStarbase();
         SetupNMEs(patrol);
       }
     }
   }
   else
   {
     if (base.nextMove!=0)
         startText("Starbase clear", border.x, 150);
     // clear count down
     base.nextMove = 0;  
   }

   // trigger the end
   if (targetBase == gameDifficulty+3 ) // zylons win
   {
      //BoardSetup(gameDifficulty);
      EndGame(basesGone);
   }
}
