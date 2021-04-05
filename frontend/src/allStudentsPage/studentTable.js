import "./allStudents.css";
import React, { useState } from "react";
function StudentTable({ studentList, sectionList }) {
  return (
    <table id="studentTable" border="4">
      <tr>
        <th>Student Name</th>
        <th>Guardian Name</th>
        <th>Contact Phone</th>
        <th>Email</th>
      </tr>
      {studentList.map((account) => {
        let filteredIn = false;
        if (account["mailing_lists"].length === 0 && sectionList.length === 0) {
          filteredIn = true;
        }
        account["mailing_lists"].map((section) => {
          if (sectionList.includes(section)) {
            filteredIn = true;
          }
        });
        if (filteredIn) {
          return account["student_list"].map((student) => {
            return (
              <tr>
                <td>
                  {student["first_name"]} {student["last_name"]}
                </td>
                <td>
                  {account["guardians"][0]["first_name"]}{" "}
                  {account["guardians"][0]["last_name"]}
                </td>
                <td>{account["guardians"][0]["phone_number"]}</td>
                <td>{account["guardians"][0]["email"]}</td>
              </tr>
            );
          });
        } else {
          return;
        }
      })}
    </table>
  );
}

export default StudentTable;
