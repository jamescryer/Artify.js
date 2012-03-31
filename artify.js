(function(w){
	'use strict';
	
	var $ = w.jQuery,
		FileReader = w.FileReader,
		Image = w.Image;

	function _generateCss3Art( sourceImageData, width, height, random ){

		var $c = $('<div/>'),
			percentileWidth = (100 / width) + '%',
			percentileHeight = (100 / height) + '%';

		$.each( new Array( height ), function( verticalPos ){

			$.each( new Array( width ), function( horizontalPos ){
				
				var offset = (verticalPos*width + horizontalPos) * 4,
					red = sourceImageData[offset],
					green = sourceImageData[offset + 1],
					blue = sourceImageData[offset + 2],
					alpha = sourceImageData[offset + 3],
					brightness = (0.3*red + 0.59*green + 0.11*blue) / 255,
					shade = (10 - Math.round(brightness * 10));
				
				$c.
					append( $('<span />').
						addClass('shade-'+shade).
						css({
							width: percentileWidth,
							height: percentileHeight
						})
					);
			});
						
			return true;		
		});

		return $c.html();
	}
	
	function _getArtFromData( fileData, w, h, callback ){
        
		var isFileData = typeof fileData !== 'string',
			hiddenCanvas = $('<canvas />').get(0),
			canvas2dContext = hiddenCanvas.getContext('2d'),
			hiddenImage = new Image(),
			fileReader;
		
		hiddenImage.onload = function() {
			
			var imageData,
				$art;

			hiddenCanvas.getContext('2d').drawImage(hiddenImage, 0, 0, hiddenImage.width, hiddenImage.height, 0, 0, w, h);
			imageData = hiddenCanvas.getContext('2d').getImageData(0, 0, w, h).data;
			
			$art = _generateCss3Art(imageData, w, h);
			
			callback($art);
		};
		
		if(isFileData){
			fileReader = new FileReader();
			
			fileReader.onload = function (event) {  
				hiddenImage.src = event.target.result; 
			};
				
			fileReader.readAsDataURL(fileData);
		} else {
			hiddenImage.src = fileData; 
		}
	}
	
	$.fn['artify'] = function( options ){
		
		var size;
		
		options = $.extend({},{
			unitSize: 10, // size of each block
			className: 'neutral spot'
		},options); 
				
		return $(this).each(function(){
			var $target = $(this),
				dragOverClassName = 'artify-drag-over',
				dropzoneClassName = 'artify-drop-zone',
				width = $target.outerWidth(),
				height = $target.outerHeight(),
				widthSize = Math.floor(width / options.unitSize),
				heightSize = Math.floor(height / options.unitSize);
			
			function getFrame($art){
				return $('<div class="artify"/>').
					addClass( options.className ).
					css({
						width: width,
						height: height
					}).
					append($art);
			}

			if(this.tagName === 'IMG'){
				_getArtFromData(this.src, widthSize, heightSize, function($art){
					$target.replaceWith(  getFrame($art) );
				});
				
				return;
			}

			if(!FileReader){ // not supported by IE9
				return;
			}

			$target.
				bind('dragover', function(){ 
					$target.addClass( dragOverClassName ); 
					return false;
				}).
				bind("dragend", function () { 
					$target.removeClass( dragOverClassName ); 
					return false;
				}). 
				bind("drop", function(event) {
					var file = event.originalEvent.dataTransfer.files[0];  

                    event.stopPropagation();
                    event.preventDefault();

					$target.removeClass( dragOverClassName ); 

					_getArtFromData(file, widthSize, heightSize, function($art){
						
						$target.
							removeClass( dropzoneClassName ).
							html( getFrame($art) )
						;
					});
				})
			;
		});
	};
}(this));