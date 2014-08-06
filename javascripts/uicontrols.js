// array to hold all buttons
var buttons = [];


// checks hits against the button list
function CheckButtons(x, y, checking)
{
   var buttonhit=false;
   for (var i=0; i<buttons.length; i++)
   {
     buttonhit |= buttons[i].hit(x,y,checking);
   }
   return buttonhit;
}

// renders the buttons
function RenderButtons()
{
   for (var i=0; i<buttons.length; i++)
   {
     buttons[i].render();
   }
}

function ClearButtonState(name)
{
   for (var i=0; i<buttons.length; i++)
   {
     if (name == buttons[i].name)
     {
       buttons[i].state = 0;
     }
   }
}

// debug function to emumlate button presses
function PressButton(name)
{
   for (var i=0; i<buttons.length; i++)
   {
     if (name == buttons[i].name)
     {
       buttons[i].callback(buttons[i]);
     }
   }
}

// debug function to emumlate button presses
function GetControl(name)
{
   for (var i=0; i<buttons.length; i++)
   {
     if (name == buttons[i].name)
     {
       return buttons[i];
     }
   }
}

function Button(x, y, w, h, name, callback)
{
  this.hitX = 0;
  this.hitY = 0;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.name = name;
  this.callback = callback;
  this.state = 0;
  // add button to stack
  buttons.push(this);
}

Button.prototype.render = function()
{
  // generate 8 points for the 3d button
  /*
  var x1 = this.x;
  var x2 = this.x+this.w;
  var y1 = this.y*2;
  var y2 = this.y*2+this.h;
  var z1 = 0;
  var z2 = 20;
  var b = 10;
  var coordinates = [x1, y1, z1, x2, y1, z1, x2, y2, z1, x1, y2, z1,
                     x1-b, y1-b, z2, x2+b, y1-b, z2, x2+b, y2+b, z2, x1-b, y2+b, z2];
  var transforms = [];
  
  var hud = new matrix3x3();
  hud.rotateX(-Math.PI*0.25);
  var temp = new matrix3x3();
  temp.rotateZ(-Math.PI*0.25);
  hud.clone(hud.multiply(temp));
  
  for (var i=0; i<8; i++)
  {
      var x = coordinates[i*3+0];
      var y = coordinates[i*3+1];
      var z = coordinates[i*3+2];
       
      var t = hud.transform(x,y,z);
      var depth = focalPoint*4/ ((t.z +focalDepth*20) +1);
      transforms[i] = {x:t.x*depth, y:t.y*depth};
   }
   
  var polys = [3,2,1,0, 0,1,5,4, 1,2,6,5, 2,3,7,6, 3,0,4,7, 4,5,6,7];
  for (var i=0; i<5; i++)
  {
     var c0 = transforms[polys[i*4+0]];
     var c1 = transforms[polys[i*4+1]];
     var c2 = transforms[polys[i*4+2]];
     var c3 = transforms[polys[i*4+3]];

     context.beginPath();
     context.moveTo(c0.x, c0.y);
     context.lineTo(c1.x, c1.y);
     context.lineTo(c2.x, c2.y);
     context.lineTo(c3.x, c3.y);
     context.closePath();

     // cross product
     var dx1 = c1.x-c0.x;
     var dx2 = c1.x-c2.x;
     var dy1 = c1.y-c0.y;
     var dy2 = c1.y-c2.y;
     var cross = dx1 * dy2 - dx2 * dy1;
     var shade = Math.floor(cross*0.25);

     context.fillStyle = 'rgba(0,'+shade+',0,0.5)';
     context.fill();
     context.strokeStyle = 'rgba(192,255,192,0.5)';
     context.stroke();
  }
  */
    // fill a rect
  context.beginPath();
  context.rect(this.x, this.y, this.w, this.h);
  if (this.state==0)
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
  else
    context.fillStyle = 'rgba(0, 128, 0, 0.5)';
  context.fill();

  context.lineWidth = 2;
  context.strokeStyle = 'rgba(120, 240, 120, 0.5)';
  context.stroke();
  
  context.moveTo(this.x, this.y);
  context.font = '10pt Calibri';
  context.fillStyle = 'rgba(127,255,127, 1)';
  context.textAlign = "center";
  context.fillText(this.name, this.x+this.w/2, this.y+this.h-9);
}

Button.prototype.hit = function(x, y, checking)
{
   if (x>=this.x && x<this.x+this.w && y>this.y && y<this.y+this.h)
   {
      // hit
     if (!checking) this.callback(this);
     return true;
   }
   return false;
}

function Slider(x, y, w, h, marks, vert, range,name, callback)
{
  this.hitX = 0;
  this.hitY = 0;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.marks = marks;
  this.range = range;
  this.vertical = vert;
  this.name = name;
  this.callback = callback;
  this.state = 0;
  this.value = 0;
  // add button to stack
  buttons.push(this);
}

Slider.prototype.render = function()
{

    // fill a rect
  context.beginPath();
  context.rect(this.x, this.y, this.w, this.h);
  if (this.state==0)
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
  else
    context.fillStyle = 'rgba(0, 128, 0, 0.5)';
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = 'rgba(120, 240, 120, 0.5)';
  context.stroke();
  
  var offset = this.value/this.range;
  var size = this.h/this.range;
  context.beginPath();
  context.rect(this.x-10, this.y+this.h-offset*this.h, this.w+20, -this.h/this.range);
  context.fillStyle = 'rgba(0, 128, 0, 0.5)';
  context.fill();

  context.moveTo(this.x, this.y);
  context.font = '10pt Calibri';
  context.fillStyle = 'rgba(127,255,127, 1)';
  context.textAlign = "center";
  context.fillText(this.name, this.x+this.w/2, this.y+this.h-9);
}

Slider.prototype.hit = function(x, y)
{
   if (x>=this.x && x<this.x+this.w && y>this.y && y<this.y+this.h)
   {
     // hit
     if (this.vertical)
     {
        this.value = Math.floor((this.y+this.h - y) / this.h * this.range);
     }
     else
     {
        this.value = Math.floor((this.x+this.w - x) / this.w * this.range);     
     }
     
     this.callback(this);
     return true;
   }
  
   return false;
}