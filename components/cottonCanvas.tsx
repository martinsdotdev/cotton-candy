"use client"

import { useRef, useEffect } from "react"



function getRandomBetween(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomPosition(maxWidth, maxHeight) {
    return {
	x: getRandomBetween(0, maxWidth),
	y: getRandomBetween(0, maxHeight)
    }
}

function drawRetangle(context, position) {
    const size = getRandomPosition(20, 20);
    context.fillRect(position.x, position.y, size.x + 5, size.y + 5) 
}

function drawCircle(context, position) {
    const radius = getRandomBetween(5, 20);
    console.log('radius: ' + radius)
    context.beginPath()
    context.ellipse(position.x, position.y, radius, radius, Math.PI / 4, 0, 2 * Math.PI)
    context.fill()
}

function drawGeometry(context, position, geometry) {
    console.log("drawGeometry " + geometry)
    if(geometry == 'quadrado')
	drawRetangle(context, position)
    else if (geometry == 'circulo')
	drawCircle(context, position)
}


/**
  https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
export function CottonCanvas(props: any) {
    const name = props.user.nome;
    const geometries = props.user.instrucao;
    
    const canvasRef = useRef(null);
    const colorRef = useRef({
	r: getRandomBetween(0, 255),
	g: getRandomBetween(0, 255),
	b: getRandomBetween(0, 255),
    })
    useEffect(() => {
	
	const canvas = canvasRef.current
	const context = canvas.getContext('2d')
	const canvasWidth = context.canvas.width
	const canvasHeight= context.canvas.height;
	const color = colorRef.current;
	console.log(colorRef)
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	const colorString = `#${color.r.toString(16)}${color.g.toString(16)}${color.b.toString(16)}`
	
	context.fillStyle = colorString;
	
	let position = getRandomPosition(canvasWidth - 40, canvasHeight - 20);
	
	context.fillText(name, position.x, position.y)
	for (let geometry of geometries) {
	    position = getRandomPosition(canvasWidth - 20, canvasHeight - 20);
	    drawGeometry(context, position, geometry);
	}
    }, [])
    return (
	<>
	    <canvas ref={canvasRef} id='cotton-canvas'>
		<p> :\( no canvas available </p>
		<p> unable to draw on browser without canvas support</p>
	    </canvas>
	</>
    )
}


/*
  ${instrucao}desenho quadrado ${instrucao}
  ${identifica}Leticia${identifica}${instrucao}desenho circulo${instrucao} ${instrucao}quadrado ${instrucao}
  ${identifica}Pedro${identifica}${instrucao}desenho quadrado${instrucao}
  
  */
