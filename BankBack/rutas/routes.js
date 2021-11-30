// MYSQL
const mysql = require('mysql')
const db = mysql.createConnection({
host: process.env.DATABASE_URL , // "",
user: process.env.DATABASE_USER , // "",
password: process.env.DATABASE_PASS , // "",
database: process.env.DATABASE_DB  // "" 
})

module.exports = db;

// JSON data
let respuesta = {
    error: false,
    codigo: 200,
    mensaje: ''
};

// Router
const router = app => {

    //*************  TABLA USUARIO  *******************/

    //crear usuario
    app.post('/api/v1/usuario', async(req, res) => {
        const correo = req.body.correo;
        const contraseña = req.body.contraseña;
        const rol = req.body.rol;
        const disponible = req.body.disponible;
        const direccion = req.body.direccion;
        const dpi = req.body.dpi;
        const fechaNacimiento = req.body.fechaNacimiento;
        const nombre = req.body.nombre;
        const telefono = req.body.telefono;
        
        db.query("INSERT INTO Usuario (Correo, Contraseña, Rol, Disponible, Direccion, DPI, FechaNacimiento, Nombre, Telefono) VALUES (?,AES_ENCRYPT(?,?),?,?,?,?,?,?,?)"
                ,[correo,contraseña,process.env.DATABASE_CLAVE,rol,disponible,direccion,dpi,fechaNacimiento,nombre,telefono],
                (err,result)=>{
                    if(err) {
                        console.log(err)
                        res.sendStatus(404)
                    } else {
                        console.log(result)
                        res.sendStatus(201)
                    }
        });
    })  

    //actualizar datos del usuario --si desea cambiar el correo no se va poder tendriamos que agregar una nueva constante
    app.put('/api/v1/usuario/:Correo', async(req, res) => {

        const correo = req.body.correo;
        const contraseña = req.body.contraseña;
        const rol = req.body.rol;
        const disponible = req.body.disponible;
        const direccion = req.body.direccion;
        const dpi = req.body.dpi;
        const fechaNacimiento = req.body.fechaNacimiento;
        const nombre = req.body.nombre;
        const telefono = req.body.telefono;
        
        db.query("UPDATE Usuario SET Correo = ?, Contraseña = AES_ENCRYPT(?,?), Rol = ?, Disponible = ?, Direccion = ?, DPI = ?, FechaNacimiento = ?, Nombre = ?, Telefono = ? WHERE Correo = ?"
                ,[correo,contraseña,process.env.DATABASE_CLAVE,rol,disponible,direccion,dpi,fechaNacimiento,nombre,telefono,correo], 
        (err,result)=>{
            if(err) {
                console.log(err)
                result.sendStatus(404)
            } else {
                console.log(result)
                res.sendStatus(204)
            }
        });
    })

    //verificar correo y contraseña --login
    app.get('/api/v1/usuario/:correo', async(req, res) => {
        const correo = req.params.correo;
        const contraseña = req.body.contraseña;
         db.query("SELECT AES_DECRYPT(Contraseña,?) FROM Usuario WHERE correo = ?", [process.env.DATABASE_CLAVE,correo], 
            (err,result)=>{
                if(err) {
                    console.log(err)
                    result.sendStatus(404)
                } else {
                    if (result == contraseña) {
                        respuesta = {
                            error: true, 
                            codigo: 200, 
                            mensaje: 'Correcto'
                        };
                        res.status(200).send(respuesta);
                    }else{
                        respuesta = {
                            error: true, 
                            codigo: 404, 
                            mensaje: 'Incorrecto'
                        };
                        res.status(404).send(respuesta);
                    }
                }
            });   
    })
   

    //*************  NO ENCONTRO URL  *******************/

    app.use(function(req, res, next) {
        respuesta = {
            error: true, 
            codigo: 404, 
            mensaje: 'URL no encontrada'
        };
        res.status(404).send(respuesta);
    });

}
// Export the router
module.exports = router;