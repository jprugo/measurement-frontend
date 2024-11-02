

var glbLeyendo = false;

function ObtenerDatos(datos,divID, fnToLaunch) 
{ 
	var peticion = false; 

	if (window.XMLHttpRequest) 
	{
	      peticion = new XMLHttpRequest();
	} else if (window.ActiveXObject) 
	{
	            peticion = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	if(peticion) 
	{
		var retorno;
		var obj = document.getElementById(divID); 
		
		glbLeyendo = true;
		peticion.open("GET", datos); 
		peticion.onreadystatechange=function()  
									{ 
										if (peticion.readyState == 4) 
										{ 
											obj.innerHTML = peticion.responseText; 
											glbLeyendo = false;
										} 
									}
        
		peticion.send(); 
	}
}

function ObtenerRta(datos,divID, fnToLaunch) 
{ 
	var peticion = false; 

	if (window.XMLHttpRequest) 
	{
	      peticion = new XMLHttpRequest();
	} else if (window.ActiveXObject) 
	{
	            peticion = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	if(peticion) 
	{
		var retorno;
		var obj = document.getElementById(divID); 
		
		glbLeyendo = true;
		peticion.open("GET", datos); 
		peticion.onreadystatechange=function()  
									{ 
										if (peticion.readyState == 4) 
										{ 
											obj.innerHTML = peticion.responseText; 
											glbLeyendo = false;
										} 
									}
        
		peticion.send(peticion.responseText); 
	}
}
