require('dotenv').config();
// MYSQL
const mysql = require('mysql')
const db = mysql.createConnection({
host: process.env.DATABASE_HOST ,
user: process.env.DATABASE_USER  ,
password: process.env.DATABASE_PASS ,
database: process.env.DATABASE_DB 
})

db.connect(function(err) {
    if (err) {
        console.log("Database connection failed:" + err.stack);
        return;
    }
    console.log("Connected!");
});

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
        const Correo = req.body.Correo;
        const Contrasena = req.body.Contrasena;
        const Rol = req.body.Rol;
        const Disponible = req.body.Disponible;
        const Direccion = req.body.Direccion;
        const DPI = req.body.DPI;
        const FechaNacimiento = req.body.FechaNacimiento;
        const Nombre = req.body.Nombre;
        const Telefono = req.body.Telefono;
        
        db.query("INSERT INTO Usuario (Correo, Contraseña, Rol, Disponible, Direccion, DPI, FechaNacimiento, Nombre, Telefono) VALUES (?,AES_ENCRYPT(?,?),?,?,?,?,?,?,?)"
                ,[Correo,Contrasena,process.env.DATABASE_CLAVE,Rol,Disponible,Direccion,DPI,FechaNacimiento,Nombre,Telefono],
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
         db.query("SELECT CONVERT(AES_DECRYPT(Contraseña,?) USING utf8) as 'password' FROM Usuario WHERE correo = ?", [process.env.DATABASE_CLAVE,correo], 
            (err,result)=>{
                if(err) {
                    console.log(err);
                    result.sendStatus(404)
                } else {
                    res.status(200).send(result);
                }
            });   
    })

    //Obtener lista de usuarios
    app.get('/api/v1/usuario', async(req, res) => {
        const correo = req.params.correo;
         db.query("SELECT * FROM Usuario WHERE Correo <> 'admin@correo.com'", [correo], 
            (err,result)=>{
                if(err) {
                    console.log(err);
                    result.sendStatus(404)
                } else {
                    res.status(200).send(result);
                }
            });   
    })

    //obtiene informacion completa del usuario
    app.get('/api/v1/usuarioInfo/:correo', async(req, res) => {
        const correo = req.params.correo;
         db.query("SELECT idUsuario, Correo, CONVERT(AES_DECRYPT(Contraseña,?) USING utf8) as 'Contraseña', Rol, Disponible, Direccion, DPI, FechaNacimiento, Nombre, Telefono FROM Usuario WHERE Correo = ?;"
         , [process.env.DATABASE_CLAVE,correo], 
            (err,result)=>{
                if(err) {
                    console.log(err);
                    result.sendStatus(404)
                } else {
                    res.status(200).send(result);
                }
            });   
    })

    //Obtener ultima transferencia
    app.get('/api/v1/usuarioId', async(req, res) => {
        db.query("SELECT idUsuario " +
                 "FROM Usuario " +
                 "ORDER by idUsuario DESC LIMIT 1;", [], 
           (err,result)=>{
               if(err) {
                   console.log(err);
                   result.sendStatus(404)
               } else {
                   res.status(200).send(result);
               }
           });   
   })

    //*************  TABLA CUENTA  *******************/

    //crear cuenta  -- falta inner join en propietario entre cuenta y usuario
    app.post('/api/v1/cuenta', async(req, res) => {
        const idCuenta = req.body.idCuenta;
        const TipoCuenta = req.body.TipoCuenta;
        const MontoActual = req.body.MontoActual;
        const Propietario = req.body.Propietario;
        
        db.query("INSERT INTO Cuenta (idCuenta,TipoCuenta,MontoActual,Propietario) VALUES (?,?,?,?)"
                ,[idCuenta,TipoCuenta,MontoActual,Propietario],
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

    //actualizar datos del cuenta --Modificar campos de las cuentas Origen y Destino
    app.put('/api/v1/cuenta/:idCuenta', async(req, res) => {
        const idCuenta = req.params.idCuenta;
        
        db.query("UPDATE Cuenta SET ? WHERE idCuenta = ?",[req.body,idCuenta], 
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

    //obtiene todas las cuentas de un usuario
    app.get('/api/v1/cuenta/:correo', async(req, res) => {
        const correo = req.params.correo;
         db.query("SELECT c.idCuenta , c.TipoCuenta , c.MontoActual , c.Propietario FROM Cuenta c INNER JOIN Usuario u ON c.Propietario = u.idUsuario WHERE u.Correo = ?",
            [correo], 
            (err,result)=>{
                if(err) {
                    console.log(err);
                    result.sendStatus(404)
                } else {
                    res.status(200).send(result);
                }
            });   
    })

        //obtener listado de todas las cuentas amigas de una cuenta especifica
        app.get('/api/v1/cuentaAmiga/:cuentaOrigen', async(req, res) => {
            const cuentaOrigen = req.params.cuentaOrigen;
             db.query("SELECT c.idCuenta , u.Nombre FROM Cuenta c INNER JOIN Usuario u ON c.Propietario = u.idUsuario WHERE c.idCuenta = ?", [cuentaOrigen], 
                (err,result)=>{
                    if(err) {
                        console.log(err)
                        result.sendStatus(404)
                    } else {
                        res.status(200).send(result);
                    }
                });   
        })

    //*************  TABLA RELACIONESCUENTA  *******************/

    //crear relacioncuenta -- y viseversa la cuenta
    app.post('/api/v1/relacionCuenta', async(req, res) => {
        const cuentaOrigen = req.body.cuentaOrigen;
        const cuentaDestino = req.body.cuentaDestino;
        
        db.query("INSERT INTO RelacionesCuenta (CuentaOrigen,CuentaDestino) VALUES (?,?)"
                ,[cuentaOrigen,cuentaDestino],
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

    //obtener listado de cuentas amigas de una cuenta especifica
    app.get('/api/v1/relacionCuenta/:cuentaOrigen', async(req, res) => {
        const cuentaOrigen = req.params.cuentaOrigen;
         db.query("SELECT rc.CuentaDestino , u.Nombre FROM RelacionesCuenta rc " +
                    "INNER JOIN Cuenta c ON rc.CuentaDestino = c.idCuenta " +
                    "INNER JOIN Usuario u ON c.Propietario = u.idUsuario " +
                    "WHERE cuentaOrigen = ?;", [cuentaOrigen], 
            (err,result)=>{
                if(err) {
                    console.log(err)
                    result.sendStatus(404)
                } else {
                    res.status(200).send(result);
                }
            });   
    })

   
    //*************  TABLA TRANSFERENCIAS  *******************/

    //crear trasferencia -- y viseversa la cuenta
    app.post('/api/v1/tranferencia', async(req, res) => {
        const monto = req.body.monto;
        const accion = req.body.accion;
        const cuentaOrigen = req.body.cuentaOrigen;
        const cuentaDestino = req.body.cuentaDestino;
        
        db.query("INSERT INTO Transferencias (Monto,Accion,CuentaOrigen,CuentaDestino) VALUES (?,?,?,?)"
                ,[monto,accion,cuentaOrigen,cuentaDestino],
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

    //Obtener ultima transferencia
    app.get('/api/v1/tranferencia', async(req, res) => {
         db.query("SELECT idTransferencias " +
                  "FROM Transferencias " +
                  "ORDER by idTransferencias DESC LIMIT 1;", [], 
            (err,result)=>{
                if(err) {
                    console.log(err);
                    result.sendStatus(404)
                } else {
                    res.status(200).send(result);
                }
            });   
    })
    

    //*************  TABLA HISTORIAL  *******************/

    //aplica para crear usuario, deshabilitar usuario, habilitar usuario, tambien si se realiza una relacion cuenta
    app.post('/api/v1/historial', async(req, res) => {
        const tipoTransaccion = req.body.tipoTransaccion;
        const fechaYHora = req.body.fechaYHora;
        const descripcion = req.body.descripcion;
        
        db.query("INSERT INTO Historial(TipoTransaccion,FechaYHora,Descripcion) VALUES (?,?,?)"
                ,[tipoTransaccion,fechaYHora,descripcion],
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

    //aplica para guardar transferencia
    app.post('/api/v1/historial2', async(req, res) => {
        const fechaYHora = req.body.fechaYHora;
        const transferencia = req.body.transferencia;
        const descripcion = req.body.descripcion
        
        db.query("INSERT INTO Historial(FechaYHora,Transferencia,Descripcion) VALUES (?,?,?)"
                ,[fechaYHora,transferencia,descripcion],
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

    //obtener historial globa de movimiento
    app.get('/api/v1/historial', async(req, res) => {
         db.query("SELECT FechaYHora , TipoTransaccion , Descripcion FROM Historial " +
                  "WHERE TipoTransaccion IS NOT NULL;", [], 
            (err,result)=>{
                if(err) {
                    console.log(err)
                    result.sendStatus(404)
                } else {
                    res.status(200).send(result);
                }
            });   
    })

    //obtener historial global de transacciones
    app.get('/api/v1/historial2', async(req, res) => {
        db.query("SELECT h.FechaYHora , t.Monto , t.CuentaOrigen , t.CuentaDestino , a.NombreAccion FROM Historial  h " +
                    "INNER JOIN Transferencias t ON h.Transferencia = t.idTransferencias " +
                    "INNER JOIN Acciones a ON t.Accion = a.idAcciones " +
                    "INNER JOIN Cuenta c ON t.CuentaOrigen = c.idCuenta " +
                    "INNER JOIN Usuario u ON c.Propietario = u.idUsuario ", [], 
           (err,result)=>{
               if(err) {
                   console.log(err)
                   result.sendStatus(404)
               } else {
                   res.status(200).send(result);
               }
           });   
   })

    //obtener historial de una persona
    app.get('/api/v1/historial/:correo', async(req, res) => {
        const correo = req.params.correo;
         db.query("SELECT h.FechaYHora , t.Monto , t.CuentaOrigen , t.CuentaDestino , a.NombreAccion FROM Historial  h " +
                    "INNER JOIN Transferencias t ON h.Transferencia = t.idTransferencias " +
                    "INNER JOIN Acciones a ON t.Accion = a.idAcciones " +
                    "INNER JOIN Cuenta c ON t.CuentaOrigen = c.idCuenta " +
                    "INNER JOIN Usuario u ON c.Propietario = u.idUsuario " +
                    "WHERE u.Correo = ?;", [correo], 
            (err,result)=>{
                if(err) {
                    console.log(err);
                    result.sendStatus(404)
                } else {
                    res.status(200).send(result);
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