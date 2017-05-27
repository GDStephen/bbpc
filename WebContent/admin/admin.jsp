<%@page import="java.util.*,com.anbang.bbchat.common.GlobalUserMap"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Admin manager</title>
</head>
<body>
<%
//boolean isLogin=false;
String method = request.getParameter("method");
if("login".equals(method)){
	String pwd=request.getParameter("pwd");
	if("bbweb".equals(pwd)){
		//isLogin=true;
		session.setAttribute("admin", "admin");
	}else{
		pageContext.setAttribute("error","password error.");
	}
}
if("logout".equals(method)){
	session.setAttribute("admin", null);
}
%>
<h2><font color=red><%=pageContext.getAttribute("error")==null?"":pageContext.getAttribute("error")%></font></h2>

<%
String admin=(String)session.getAttribute("admin");
if(admin==null){
	//1.未登录。
%>
<form action="admin.jsp" method="post" name="frm">
	<input type="hidden" name="method" value="login">
	<input type="password" name="pwd" value="" />
	<button type="submit" style="background-color: #53FF53;" >Login</button>
</form>
<%
return ;
}

%>
<!-- login ok -->
<a href="admin.jsp?method=logout">logout</a>
<hr/>

<%
Map users=GlobalUserMap.onlineUserMap;
if("sendUpdateSystem".equals(method)){
	
	String content = request.getParameter("content");
	
	
	com.alibaba.fastjson.JSONObject updateCMD = new com.alibaba.fastjson.JSONObject();
	updateCMD.put("cmd", 900);// cmd 900, send update system 
	updateCMD.put("data", content);

	Set set = users.entrySet();         
	Iterator i = set.iterator(); 
	int cnt=0;
	while(i.hasNext()){      
	     Map.Entry<String, HttpSession> entry1=(Map.Entry<String, HttpSession>)i.next();    
	     HttpSession sess = entry1.getValue();
	     if(sess==null) continue;
	     Object stat=sess.getAttribute("status");
	     //System.out.println("stat="+stat);
	     if(stat==null) continue;
	     if("logged_in".equals((String)stat)){
	    	 //icoment send
	    	 
	    	String desKey=(String)sess.getAttribute("desKey");
	    	com.anbang.bbchat.common.security.DesEncryptJS des = new com.anbang.bbchat.common.security.DesEncryptJS(desKey);
			String encryptStr = des.encrypt(updateCMD.toJSONString());
			
			String icoment_push_url = com.anbang.bbchat.common.ConfigUtil.getInstance().getStringValue(
					"icoment_push_url");
			// curl -v
			// "http://10.10.140.162:8000/push?cname=7A1F2D1B6AA289095851082968418CB5&content=hi"

			StringBuilder sb = new StringBuilder();
			sb.append("?cname=")
					.append(sess.getId())
					.append("&content=")
					.append(java.net.URLEncoder.encode(encryptStr, "UTF-8"));

			java.net.HttpURLConnection conn = com.anbang.bbchat.common.HttpUtil.createHttpGetConnection(icoment_push_url + sb.toString());

			// HttpUtil.setBodyParameter(sb, conn);
			int isOK = com.anbang.bbchat.common.HttpUtil.returnCode(conn);
			if (isOK == 200) {// 提交Icomet成功
				System.out.println("sendUpdateSystem:"+(cnt++)+":"+sess.getId());
				
			}
	    	 
	     }
	     
	     
	     //out.println(entry1.getKey()+"=="+entry1.getValue());    
	}   
}

%>
当前有效tomcat session数:<%=users.size()%>

<hr/>

1，群发升级提示
<form action="admin.jsp" method="post" name="frm">
	<input type="hidden" name="method" value="sendUpdateSystem">
	<textarea rows="3" cols="40"  name="content" >您好，WEB版系统将在5分钟后升级。请暂停使用WEB端发送功能。带来的不便深表歉意。</textarea>
	<br>
	<button type="submit" style="background-color: #53FF53;">SEND MSG</button>
</form>



</body>
</html>