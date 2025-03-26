# 📡 Actualizar la IP del Backend en el Frontend  

Si el backend ha cambiado de IP y necesitas actualizar las referencias en el código del frontend, sigue estos pasos según tu sistema operativo.

---

## 🖥️ Windows  

1. Abre **PowerShell** en la carpeta donde está el código del frontend.  
2. Ejecuta el siguiente comando para reemplazar la IP anterior (`localhost`) por `localhost` en todos los archivos:  

```powershell
Get-ChildItem -Path . -Recurse -File | ForEach-Object {
    (Get-Content $_.FullName) -replace 'localhost', 'localhost' | Set-Content $_.FullName
}
```
---
## 🖥️ MAC 
1. Abre **Bash** en la carpeta donde está el código del frontend.  
2. Ejecuta el siguiente comando para reemplazar la IP anterior (`localhost`) por `localhost` en todos los archivos:  

```bash
grep -rl 'localhost' . | xargs sed -i 's/localhost/localhost/g'
```
