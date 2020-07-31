const canvas = document.querySelector('#screen');
const ctx = canvas.getContext('2d');

function draw_tiles(tiles, tileSize){
  for(const {x, y, type} of tiles){
		ctx.fillStyle = type === 'water' ?
			'blue' : 'brown';
		ctx.fillRect(x, y, tileSize, tileSize);
	}
}

function generateChunk(r0, c0, r1, c1, tSize){
  return new Promise((res, rej)=>{
  	const tiles = [];
  	for(let row=r0; row<r1; row++){
    	for(let col=c0; col<c1; col++){
      	tiles.push({
					x: col*tSize, y: row*tSize,
        	row, col,
					type: Math.random() > 0.5 ? 
	      		'water' : 'dirt'
      	});
    	}
  	}
  	setTimeout(()=>{
			try{
			  draw_tiles(tiles, tSize);
			  res(tiles);
			}catch(e){rej(e);}
		},100);
  }).catch(alert);
}

async function generateTerrain(
  rows, cols, 
  tileSize, 
  chunkSize
){
  try{
		canvas.setAttribute('width', cols*tileSize);
		canvas.setAttribute('height', rows*tileSize);
    const crows = (rows/chunkSize)|0;
    const ccols = (cols/chunkSize)|0;
      
    const total = crows*ccols;
    let pct = 0;

    const chunks = [];
    for(let i=0; i<crows; i++){
      for(let j=0; j<ccols; j++){
        const from_row = i*chunkSize;
        const from_col = j*chunkSize;
        const end_row = from_row + chunkSize;
        const end_col = from_col + chunkSize;
        chunks.push(await generateChunk(
          from_row, from_col,
          end_row > rows ? rows : end_row,
          end_row > rows ? rows : end_col,
					tileSize
        ));
	  pct += 100/total;
	  document.querySelector('progress').value = pct;
        }
      }
    return Promise.all(
      [].concat.apply([], chunks)
    );
  }catch(e){return Promise.reject(e);}
}

generateTerrain(100, 100, 4, 10)
.then(tiles=>{
  alert('Done', tiles.length);
})
.catch(alert);
