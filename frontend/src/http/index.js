import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { loggedInRole } from "../utils";

export const auth = axios.create({
  baseURL: process.env.REACT_APP_AUTH_URL,
});

export const main = axios.create({
  baseURL: process.env.REACT_APP_MAIN_URL,
});

// request interceptor for constructing the authentication header
main.interceptors.request.use(
  function (config) {
    const accessToken = sessionStorage.getItem("accessToken");
    if (accessToken !== null) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

auth.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export async function preRegister({ email }) {
  try {
    const res = await auth.post("/student/pre_register", {
      email,
    });

    return 0;
  } catch (error) {
    console.log(error.response);
    return -1;
  }
}

export async function register({ email, password, role, verification_code }) {
  try {
    const res = await auth.post("/student/register", {
      email,
      password,
      role,
      verification_code,
    });

    await login({ username: email, password });
  } catch (error) {
    console.log(error.response);
  }
}

export async function disable(data) {
  const accessToken = sessionStorage.getItem("accessToken");
  try {
    const res = await auth.put("/student/update_disabled", data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.log(error.response);
  }
}

export async function login({ username, password }) {
  const querystring = require("querystring");
  const res = await auth.post(
    "/token",
    querystring.stringify({ username, password })
  );
  const { access_token } = res.data;

  sessionStorage.setItem("accessToken", access_token);
}

export async function profile() {
  const accessToken = sessionStorage.getItem("accessToken");

  const res = await main.get("/student/get_my_profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res;
}

// TODO: change request format
export async function addProfile(data) {
  const accessToken = sessionStorage.getItem("accessToken");

  const res = await main.post("/student/add_profile", data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res;
}

// TODO: change request format
export async function updateProfile(data) {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await main.put("/student/update_profile", data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res;
}

export async function updateEmail(data) {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await auth.put("/student/update_email", data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res;
}

export async function updatePassword(data) {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await auth.put("/student/update_password", data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res;
}

export async function updateStudentVerification(data) {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await main.put("/admin/update_student_verification", data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res;
}

export async function allMeetings({ role, body }) {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await main.post(`/${role}/get_meetings`, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res;
}

export async function addMeeting(data) {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await main.post("/admin/create_meeting", data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res;
}

export async function updateMeeting(data) {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await main.put("/admin/update_meeting", data, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res;
}

export async function deleteMeeting(id) {
  const accessToken = sessionStorage.getItem("accessToken");

  const res = await main.delete("/admin/delete_meeting", {
    headers: {
      Authorization: accessToken,
    },
    data: {
      meeting_id: id,
    },
  });

  return res;
}

export async function user() {
  const accessToken = sessionStorage.getItem("accessToken");
  const res = await auth.get("/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res;
}

export async function getAllStudents() {
  const accessToken = sessionStorage.getItem("accessToken");

  const res = await main.get("/admin/get_student_profiles", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res;
}

export async function registerMeeting(data) {
  const res = await main.post("/student/update_student_for_meeting", data);
  return res;
}

export async function attendMeeting(data) {
  const res = await main.put("/admin/update_student_attendance", data);
  return res;
}

export async function uploadFile({ selectedFile }) {
  try {
    // get presigned url for post s3
    const name = selectedFile.name.split(".");
    const ext = name.pop();
    const { data } = await main.post("/presigned_url_for_upload", {
      object_name: `${name.join("_")}_${uuidv4()}.${ext}`,
    });
    const {
      url,
      fields: { key, AWSAccessKeyId, policy, signature },
    } = data;

    // send the file to s3
    const formData = new FormData();
    formData.append("key", key);
    formData.append("AWSAccessKeyId", AWSAccessKeyId);
    formData.append("policy", policy);
    formData.append("signature", signature);
    formData.append("file", selectedFile);

    const res = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return key;
  } catch (error) {
    console.log(error.response);
  }
}

export async function downloadFile({ fileType, id }) {
  const role = loggedInRole();
  if (!["material", "consent"].includes(fileType)) {
    throw new Error(`Invalid type ${fileType}`);
  }
  const url =
    fileType === "material"
      ? `/${role}/get_meeting_material_url`
      : "/admin/get_student_consent_form_url";
  const params =
    fileType === "material" ? { meeting_uuid: id } : { student_id: id };

  const { data } = await main.get(url, {
    params,
  });
  return data;
}

export async function sendReminderEmail(id) {
  const res = await main.post("/admin/send_new_meeting_email", null, {
    params: { meeting_id: id },
  });
  console.log(res);
  return res;
}
