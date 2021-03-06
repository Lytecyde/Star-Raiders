
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
// blinky cursor text scroller 
var ranks = ["GALACTIC COOK",0,"GARBAGE SCOW CAPTAIN",24,"ROOKIE",48,"NOVICE",80,"ENSIGN",112,"PILOT",144,"ACE",176,"LIEUTENANT",192,"WARRIOR",208,"CAPTAIN",224,"COMMANDER",240,"STAR COMMANDER",272];

var msgs = [ 
  "star fleet to all units\nstar cruiser 7 destroyed by zlyon fire\nposthumous rank : ", 
  "star fleet to all units\nstar cruiser 7 depleted energy, mission aborted\nrank : ", 
  "star fleet to all units\nstar cruiser 7 all enemy units destroyed\nrank :", 
  "in orbit around starbase:\ntransfering energy",
  "transfer complete", 
  "docking aborted", 
  "starbase destroyed",
  "starbase under attack",
  "shields activated",
  "shields deactivated",
  "targeting active",
  "targeting deactive"
  ];

var startDisplayTime;
var stringToDisplay = 0;
var stringDisplayPos;
var frameCount;
var currentMessage = 0;
var repeatTime = 0;

const speed = 120;
var messageList = [];

// initialization
function init()
{
  // setup canvas and context
	canvas = document.getElementById('texteffect');
	context = canvas.getContext('2d');
  
  // set canvas to be window dimensions
  resize();

  // create event listeners
  canvas.addEventListener('mousemove', mouseMove);
  canvas.addEventListener('click', mouseClick);
  window.addEventListener('resize', resize);

  // initialze variables
  randomText();

}


// input functions

function mouseMove(event) 
{
	var rect = canvas.getBoundingClientRect();

	mouseX = event.clientX - rect.left,
	mouseY = event.clientY - rect.top
}

function mouseClick()
{
  randomText();
}

function resize()
{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
    // compute centre of screen
  centreX = canvas.width/2;
  centreY = canvas.height/2;
}



function blinky(x, t)
{
  if ((t%(speed<<3))<speed<<2) return;
  context.globalAlpha = 1;
  context.beginPath();
  context.fillStyle = 'rgb(0,255,0)';
  context.fillRect(x, stringDisplayPos.y-50, 30, 50);
}

function rank(score)
{
  if (score<=-1000) return "UNRANKED";
  if (score<48) return ranks[(score&1)*2];
  
  var r = (score - 48) >>4;
  var quality = (((score-48) - (r<<4)) >>2) + 1;

  if (r<8)
  {
    r>>=1;
    quality = ( ((score-48) - (r<<5)) >>3) + 1;
  }
  else 
  {
    r-=5;
    // special case for star-commander incase of huge scores
	  if (r>=9)
    { 
      r = 9;
      quality = ((score-272) >> 3) +1;
      if (quality>4) quality = 4;
    }
  }
  

  return  ranks[4+r+r] + ' class ' + quality;
  
}

function randomText()
{
  messageList = [];
  var item = Math.floor(Math.random() * msgs.length);
   var msg = msgs[item];
  if (item<3) msg = msg + rank(Math.random()*400-80);
  var d = new Date();
  startDisplayTime = d.getTime();
  currentMessage = 0;
  startText(msg, 50, 150);  

}

function clearText()
{
  messageList = [];
  currentMessage = 0;
  repeatTime = 0;
  startDisplayTime = (new Date()).getTime();
}

function startText(string, x, y)
{
  if (messageList[currentMessage]==null)
  {
    var d = new Date();
    startDisplayTime = d.getTime();
  }
  stringToDisplay = string;
  stringDisplayPos = {x:x,y:y}
  repeatTime = 0;
  
  var strings = string.split('\n');
  messageList.push.apply(messageList, strings);
  
}

function displayText()
{
	var d = new Date();
	var t = d.getTime();
  if (repeatTime!=0 && t> repeatTime)
    {
      startDisplayTime = t;
      repeatTime = 0;
      currentMessage = 0;
      messageList = [];
    }
  var current = t - startDisplayTime;
  var frame = current%speed;
  var stringRenderedLength = current/speed;
  
  context.globalCompositeOperation = 'lighter';
  context.globalAlpha = 1.0;
  context.font = '30pt Orbitron';
  context.fillStyle = 'rgb(0,255,0)';
  context.strokeStyle = 'rgb(192, 255,192)';
  context.lineWidth = 1;
  context.textAlign = "left";

  if (messageList.length==0) return;
  var cursorPos;
  for (var i=0; i<currentMessage; i++)
  {
      var y = stringDisplayPos.y-(currentMessage-i)*35;
      context.fillText(messageList[i], stringDisplayPos.x, y);
      context.strokeText(messageList[i], stringDisplayPos.x, y);
  }
  

  stringToDisplay = messageList[currentMessage];
  if (stringToDisplay==null) return;
  if (stringRenderedLength>stringToDisplay.length) 
  {
      var y = stringDisplayPos.y;
      context.fillText(messageList[i], stringDisplayPos.x, y);
      context.strokeText(messageList[i], stringDisplayPos.x, y);
   
	    cursorPos = context.measureText(stringToDisplay);
      if (repeatTime<t) repeatTime = t + 5000;
         currentMessage++;
         var d = new Date();
         startDisplayTime = d.getTime();
  }
  else
  {
		context.fillText(stringToDisplay.substr(0, stringRenderedLength), stringDisplayPos.x, stringDisplayPos.y);
		context.strokeText(stringToDisplay.substr(0, stringRenderedLength), stringDisplayPos.x, stringDisplayPos.y);
     
    
    for (var i=0; i<5; i++)
    {
	   cursorPos = context.measureText(stringToDisplay.substr(0, stringRenderedLength+i));
      context.globalAlpha = (1.0 - (i*0.2)) + ((frame/speed) * 0.2);
      context.fillText(stringToDisplay.substr(stringRenderedLength+i, 1), stringDisplayPos.x+cursorPos.width, stringDisplayPos.y);
      context.strokeText(stringToDisplay.substr(stringRenderedLength+i, 1), stringDisplayPos.x+cursorPos.width, stringDisplayPos.y);
    }
  }

  
	blinky(stringDisplayPos.x + cursorPos.width, t);

  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = 1;
}

// rendering functions

function render()
{
  context.fillStyle = 'black';
  context.clearRect(0, 0, canvas.width, canvas.height);
  
	displayText();

  context.globalAlpha = 1;
  context.font = '14pt Calibri';
  context.fillStyle = 'rgb(255,255,255)';
  context.textAlign = "center";
  context.fillText("oldschool ticker text with carat.", canvas.width/2, 100);
  context.fillText("(mouse click to randomize text)", canvas.width/2, 130);
  
}

// movement functions

function update()
{ 

}

// per frame tick functions

function animate()
{
  frameCount++;
  // movement update
  update();
  // render update
  render();
  // trigger next frame
  requestAnimationFrame(animate);
}



// entry point

//init();
//animate();