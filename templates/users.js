const { sendEmail } = require("../helpers/email");

exports.sendWelcomeMailWithCredentials = async (userData) => {
  try {
    const mailData = {
      subject: "Welcome to Software-CO Role Management System",
      html: ` <p><strong>Hi ${userData.first_name}</strong>,<br>
            Welcome aboard! I've just added you to Software-CO Role Management System. 
            <br>Use below credentials for access your account :
            <br>
            <table> 
                <tr style="background-color:#f9f9f9">
                <td width="125" style="padding:10px;border-bottom:1px solid #e9e9e9;border-right:1px solid #e9e9e9"> Log In link : </td> <td> <a href= "#" > rolemanagement.software-co.com </a> </td></tr>
                <tr style="background-color:#fff"> <td  style="padding:10px;border-bottom:1px solid #e9e9e9;border-right:1px solid #e9e9e9"> Login Id : </td> <td> ${userData.email} </td> </tr>
                <tr> <td  style="padding:10px;border-bottom:1px solid #e9e9e9;border-right:1px solid #e9e9e9"> Password : </td> <td> ${userData.password} </td> </tr>
            </table>
                <br><br>
                Regards,&nbsp;<br>
                <strong>Software-CO</strong> </p>`,
    };

    await sendEmail(userData.email, mailData, []);
    return;
  } catch (error) {
    console.log("🚀 ~ exports.sendWelcomeMailWithCredentials= ~ error:", error);
  }
};
