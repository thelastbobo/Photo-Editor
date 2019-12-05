
// install npm 
// run npx http-server to start the web servers
(function($) {
	var dragging = false,
		dragStartLocation,
		snapshot,
		inUse,
		colorInput = document.getElementById("color");;
	var editor = document.getElementById("canvas"),
		 context = editor.getContext("2d"),
		//  image = $("<img/>")
		// 		 .attr("src", "square.jpg")
		// 		 .on("load", function() { context.drawImage(this, 0, 0)
		// 		}),
		 image = document.createElement("img"),
		 mouseDown = false,
		 hasText = true,
		 clearCanvas = function() {
			 if(hasText) {
				 context.clearRect(0, 0, editor.width, editor.height);
				 hasText = false;
			 }
		 },
		 tools = {
			 save: function() {
				 var saveDialog = $("<div>").appendTo("body");

				 $("<img/>", {
					src: editor.toDataURL()
				 }).appendTo(saveDialog);

				 saveDialog.dialog({
					 resizable: false,
					 modal: true,
					 title: "Right click and choose 'Save Image As'",
					 width: editor.width + 35
			 });
			 },
			 delete: function() {
				 inUse = 'delete';
				context.clearRect(0, 0, editor.width, editor.height);
				emptyCanvasText();
			 },
			 drawCircle: function() {
				inUse = 'Circle';
				Draw();
			 },
			 drawLine: function() {
				inUse = 'Line';
				Draw();
			 },
			 drawPolygon: function() {
				inUse = 'Polygon';
				Draw();
			 },
			 resize: function() {
				 var coords = $(editor).offset();
				 	 resizer = $("<div>", {
						id: "resizer"
					  }).css({
						position: "absolute",
						left: coords.left,
						top: coords.top,
						width: editor.width - 1,
						height: editor.height - 1
					  }).appendTo("body");

				var resizeWidth = null,
					resizeHeight = null,
					xpos = editor.offsetLeft + 5,
					ypos = editor.offsetTop + 5;

				resizer.resizable({
					aspectRatio: true,
					containment: "#editor",
					resize: function(e, ui) {
						resizeWidth = Math.round(ui.size.width),
						resizeHeight = Math.round(ui.size.height);

						var string = "New width: " + resizeWidth + "px, <br/>New height: " + resizeHeight + "px";

						if($("#tip").length) {
							$("#tip").html(string)
						} else {
							var tip = $("<p></p>", {
								id: "tip",
								html: string
							}).css({
								left: xpos,
								top: ypos
							})
							.appendTo("body");
						}
					},
					stop: function() {
						var confirmDialog = $("<div></div>", {
							html: "Image will be resized to " + resizeWidth + "px wide, and " + resizeHeight + "px height.<br/>Procced?"
						});

						confirmDialog.dialog({
							resizable: false,
							modal: true,
							title: "Confirm resize?",
							buttons: {
								Cancel: function() {
									$(this).dialog("close");
									resizer.remove();
									$("#tip").remove();
								},
								Accept: function() {
									$(this).dialog("close");
									resizer.remove();
									$("#tip").remove();

									$("<img/>", {
										src: editor.toDataURL(),
										
									}).on("load", function() {
										context.clearRect(0, 0, editor.width, editor.height);
										editor.width = resizeWidth;
										editor.height = resizeHeight;

										context.drawImage(this, 0, 0, resizeWidth, resizeHeight);
									});
								}						
							}
						})
					}
				})
			 }
		 }

		 $("#toolbar").children().on("click", function(e){
			e.preventDefault();

			tools[this.id].call(this);
		});

		emptyCanvasText();

		 // Image for loading
		 image.addEventListener("load", function () {
			 clearCanvas();
			 context.drawImage(image, 0, 0);
		 }, false);

		 // To enable drag and drop
		 editor.addEventListener("dragover", function (e){
			 e.preventDefault();
		 }, false);

		 // Handle dropped image file
		 editor.addEventListener("drop", function (e){
			var files = e.dataTransfer.files;
			if(files.length > 0) {
				var file = files[0];
				if(typeof FileReader !== "undefined" && file.type.indexOf("image" != -1)){
					var reader = new FileReader();

					reader.onload = function (e) {
						image.src = e.target.result;
					};
					reader.readAsDataURL(file);
				}
			}
			e.preventDefault();
		 }, false);

		 function emptyCanvasText() {
			context.textAlign = "centre";
			context.font = "16px Arial"
			context.fillText("Drag & Drop an image onto the canvas", 350, 500);
			hasText = true;
		   };

		colorInput.addEventListener("input", watchColorPicker, false);

		function watchColorPicker(event) {			
			context.strokeStyle = event.target.value;
			context.fillStyle = event.target.value;
		}

		function Draw() {
			clearCanvas();
			context.lineWidth = 4;
			context.lineCap = 'square';

			editor.addEventListener('mousedown', dragStart, false);
			editor.addEventListener('mousemove', drag, false);
			editor.addEventListener('mouseup', dragStop, false);
		}

		function dragStart(event) {
			dragging = true;
			dragStartLocation = getCanvasCoordinates(event);
			takeSnapshot();
		}

		function drag(event) {
			var position;
			if(dragging === true){
				restoreSnapshot();
				position = getCanvasCoordinates(event);
				drawFigure(position, inUse);
			}
		}

		function dragStop(event) {
			dragging = false;
			restoreSnapshot();
			var position = getCanvasCoordinates(event);
			drawFigure(position, inUse);
		}

		function drawFigure(position, figureType) {
			switch(figureType) {
				case 'Line' :
					drawLine(position);
					break;
				case 'Circle':
					drawCircle(position);
					break;
				case 'Polygon':
					var sides = document.getElementById('sides');
					drawPolygon(position, sides.value, Math.PI / 4);
			}
		}

		function getCanvasCoordinates(event) {
			var x = event.clientX - editor.getBoundingClientRect().left,
				y = event.clientY - editor.getBoundingClientRect().top;
				
			return {x: x, y: y};
		}

		// get image for the coordinates on mouse down event
		function takeSnapshot() {
			snapshot = context.getImageData(0, 0, editor.width, editor.height);
		}

		// restore the saved image on the mouse up event to have a straight line
		function restoreSnapshot() {
			context.putImageData(snapshot, 0, 0);
		}

		function drawLine(position) {
			context.beginPath();
			context.moveTo(dragStartLocation.x, dragStartLocation.y);
			context.lineTo(position.x, position.y);
			context.stroke();
		}

		function drawCircle(position) {
			var radius = Math.sqrt(Math.pow((dragStartLocation.x - position.x), 2) + Math.pow((dragStartLocation.y - position.y), 2));
			context.beginPath();
			context.arc(dragStartLocation.x, dragStartLocation.y, radius, 0, 2 * Math.PI, false);
			context.fill();
		}

		function drawPolygon(position, sides, angle) {
			var coordinates = [],
				radius = Math.sqrt(Math.pow((dragStartLocation.x - position.x), 2) + Math.pow((dragStartLocation.y - position.y), 2)),
				index = 0;

			for( index = 0; index < sides; index++) {
				coordinates.push({ x: dragStartLocation.x + radius * Math.cos(angle) , y: dragStartLocation.y - radius * Math.sin(angle)});
				angle += ( 2 * Math.PI) / sides;
			}

			context.beginPath();
			context.moveTo(coordinates[0].x, coordinates[0].y);
			for (index = 1; index < sides; index++) {
				context.lineTo(coordinates[index].x, coordinates[index].y);
			}

			context.closePath();
			context.fill();

		}
})(jQuery)