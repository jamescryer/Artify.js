(function(w){
	'use strict';
	
	var $ = w.jQuery,
		FileReader = w.FileReader
	;

	function _generateCss3Art( sourceImageData, width, height ){

		var $container = $('<div class="artify"/>'),
			percentileWidth = (100 / width) + '%',
			percentileHeight = (100 / height) + '%'
		;

		$.each( new Array( height ), function( verticalPos ){

			$.each( new Array( width ), function( horizontalPos ){
				
				var offset = (verticalPos*width + horizontalPos) * 4,
					red = sourceImageData[offset],
					green = sourceImageData[offset + 1],
					blue = sourceImageData[offset + 2],
					alpha = sourceImageData[offset + 3],
					brightness = (0.3*red + 0.59*green + 0.11*blue) / 255,
					shade = (10 - Math.round(brightness * 10)) / 10
				;
				
				$('<span/>').
					css({
						opacity: shade,
						width: percentileWidth,
						height: percentileHeight
					}).
					appendTo($container)
				;
			});
		});
		
		return $container;
	}
	
	function _getImageData( fileData, callback ){
        
		var fileReader = new FileReader(),
			hiddenCanvas = $('<canvas />').css({display:'none'}).appendTo($('body')).get(0),
			canvas2dContext = hiddenCanvas.getContext('2d'),
			hiddenImage = new Image()
		;
		
		fileReader.readAsDataURL(fileData);

		fileReader.onload = function (event) {  
			hiddenImage.src = event.target.result; 
		};

		hiddenImage.onload = function() {
			
			var width = 24,
				height = 24,
				imageData
			;

			hiddenCanvas.getContext('2d').drawImage(hiddenImage, 0, 0, hiddenImage.width, hiddenImage.height, 0, 0, width, height);
			imageData = hiddenCanvas.getContext('2d').getImageData(0, 0, width, height).data;
			
			callback(imageData, width, height);
		};
	}

	$.fn['artify'] = function(){
		return $(this).each(function(){
			var dropZone = $(this),
				dragOverClassName = 'artify-drag-over',
				dropzoneClassName = 'artify-drop-zone'
			;

			dropZone.
				bind('dragover', function(){ 
					dropZone.addClass( dragOverClassName ); 
					return false;
				}).
				bind("dragend", function () { 
					dropZone.removeClass( dragOverClassName ); 
					return false;
				}). 
				bind("drop", function(event) {
					var file = event.originalEvent.dataTransfer.files[0];  

                    event.stopPropagation();
                    event.preventDefault();

					dropZone.removeClass( dragOverClassName ); 

					_getImageData( file, function(){
						var $art = _generateCss3Art.apply(null, arguments);
						$art.css({
							width: dropZone.outerWidth(),
							height: dropZone.outerHeight()
						});
						dropZone.removeClass( dropzoneClassName ).html( $art );
					});
					
				})
			;
		});
	};
	
}(this));