import React from "react";
import Mail from "./components/mail";
import dynamic from "next/dynamic";



function MailPage() {
  // const layout = cookies().get("react-resizable-panels:layout:mail");
  // const collapsed = cookies().get("react-resizable-panels:collapsed");

  // const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  // const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;
  return (
    <div>
      {" "}
      <Mail
        defaultLayout={[20, 32, 48]}
        defaultCollapsed={true}
        navCollapsedSize={4}
      />
    </div>
  );
}

export default MailPage;
