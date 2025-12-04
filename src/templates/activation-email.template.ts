export const getActivationEmailTemplate = (
  userName: string,
  activationUrl: string
): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activa tu cuenta - Car Meet</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            color: white;
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 700;
        }
        .header .icon {
            font-size: 64px;
            margin-bottom: 15px;
        }
        .content {
            padding: 40px 30px;
            color: #333;
        }
        .content h2 {
            color: #667eea;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content p {
            line-height: 1.8;
            color: #555;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        .activate-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 48px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 18px;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .activate-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(102, 126, 234, 0.6);
        }
        .info-box {
            background: #f8f9ff;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        .info-box p {
            margin: 0;
            color: #667eea;
            font-size: 14px;
        }
        .alternative-link {
            background: #f8f9ff;
            padding: 15px;
            border-radius: 8px;
            margin-top: 25px;
            word-break: break-all;
        }
        .alternative-link p {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
        }
        .alternative-link a {
            color: #667eea;
            font-size: 13px;
            text-decoration: none;
        }
        .footer {
            background: #f8f9ff;
            padding: 30px;
            text-align: center;
            color: #888;
            font-size: 14px;
        }
        .footer p {
            margin: 5px 0;
            color: #888;
        }
        .footer .social-links {
            margin-top: 20px;
        }
        .footer .social-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
            font-weight: 600;
        }
        .car-icon {
            display: inline-block;
            font-size: 48px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">🚗</div>
            <h1>Car Meet</h1>
        </div>
        
        <div class="content">
            <h2>¡Bienvenido, ${userName}! 🎉</h2>
            
            <p>
                Nos emociona que te unas a nuestra comunidad de amantes de los autos. 
                Estás a un solo paso de comenzar a conectar con otros entusiastas y participar 
                en eventos increíbles.
            </p>
            
            <p>
                Para activar tu cuenta y comenzar tu experiencia, simplemente haz clic en el botón de abajo:
            </p>
            
            <div class="button-container">
                <a href="${activationUrl}" class="activate-button">
                    ✨ Activar mi cuenta
                </a>
            </div>
            
            <div class="info-box">
                <p>
                    <strong>⏰ Importante:</strong> Este enlace es válido por 24 horas. 
                    Después de ese tiempo, necesitarás solicitar uno nuevo.
                </p>
            </div>
            
            <p>
                Una vez activada tu cuenta, podrás:
            </p>
            <ul style="color: #555; line-height: 2; margin-left: 20px; margin-bottom: 20px;">
                <li>🚘 Registrar tus autos favoritos</li>
                <li>📅 Participar en eventos exclusivos</li>
                <li>🏆 Votar por los mejores autos</li>
                <li>💬 Conectar con la comunidad</li>
            </ul>
            
            <div class="alternative-link">
                <p><strong>¿El botón no funciona?</strong> Copia y pega este enlace en tu navegador:</p>
                <a href="${activationUrl}">${activationUrl}</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #888;">
                Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Car Meet App</strong></p>
            <p>La comunidad de amantes de los autos</p>
            <p style="margin-top: 15px; font-size: 12px;">
                © ${new Date().getFullYear()} Car Meet. Todos los derechos reservados.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

export const getActivationSuccessTemplate = (userName: string): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Cuenta Activada! - Car Meet</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .header .icon {
            font-size: 80px;
            margin-bottom: 15px;
        }
        .header h1 {
            color: white;
            font-size: 32px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
            color: #333;
        }
        .content h2 {
            color: #10b981;
            font-size: 28px;
            margin-bottom: 20px;
        }
        .content p {
            line-height: 1.8;
            color: #555;
            font-size: 16px;
            margin-bottom: 15px;
        }
        .success-icon {
            font-size: 100px;
            margin: 20px 0;
        }
        .footer {
            background: #f8f9ff;
            padding: 30px;
            text-align: center;
            color: #888;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">🚗</div>
            <h1>Car Meet</h1>
        </div>
        
        <div class="content">
            <div class="success-icon">✅</div>
            <h2>¡Cuenta Activada Exitosamente!</h2>
            <p>
                ¡Felicidades, <strong>${userName}</strong>! Tu cuenta ha sido activada correctamente.
            </p>
            <p>
                Ya puedes iniciar sesión y comenzar a disfrutar de toda la experiencia Car Meet.
            </p>
            <p style="margin-top: 30px; color: #10b981; font-weight: 600; font-size: 18px;">
                ¡Bienvenido a la comunidad! 🎉
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Car Meet App</strong></p>
            <p>© ${new Date().getFullYear()} Car Meet. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
  `;
};

export const getVerificationCodeTemplate = (
  userName: string,
  verificationCode: string
): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Verificación - Car Meet</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .header .icon {
            font-size: 80px;
            margin-bottom: 15px;
        }
        .header h1 {
            color: white;
            font-size: 32px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
            color: #333;
        }
        .content h2 {
            color: #f59e0b;
            font-size: 28px;
            margin-bottom: 20px;
        }
        .content p {
            line-height: 1.8;
            color: #555;
            font-size: 16px;
            margin-bottom: 15px;
        }
        .code-container {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
        }
        .verification-code {
            font-size: 48px;
            font-weight: 700;
            color: white;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .warning-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        .warning-box p {
            margin: 0;
            color: #92400e;
            font-size: 14px;
            font-weight: 600;
        }
        .security-info {
            background: #f8f9ff;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        .security-info p {
            margin: 0;
            color: #667eea;
            font-size: 14px;
        }
        .footer {
            background: #f8f9ff;
            padding: 30px;
            text-align: center;
            color: #888;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">🔐</div>
            <h1>Car Meet</h1>
        </div>
        
        <div class="content">
            <h2>¡Hola, ${userName}! 👋</h2>
            
            <p>
                Hemos detectado un intento de inicio de sesión en tu cuenta. 
                Para completar el proceso de autenticación, utiliza el siguiente código de verificación:
            </p>
            
            <div class="code-container">
                <div class="verification-code">${verificationCode}</div>
            </div>
            
            <div class="warning-box">
                <p>
                    ⏰ <strong>Importante:</strong> Este código expira en 5 minutos por seguridad.
                </p>
            </div>
            
            <div class="security-info">
                <p>
                    🛡️ <strong>Seguridad:</strong> Si no intentaste iniciar sesión, 
                    ignora este correo y considera cambiar tu contraseña.
                </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #888;">
                Este código es de un solo uso y se invalidará después de ser utilizado.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Car Meet App</strong></p>
            <p>© ${new Date().getFullYear()} Car Meet. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
  `;
};
