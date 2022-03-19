/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";
import { fireEvent, screen } from "@testing-library/dom";

describe("Given that I am a user on login page", () => {
   describe("When I do not fill fields and I click on employee button Login In", () => {
      // #01
      test("Then It should renders Login page", () => {
         document.body.innerHTML = LoginUI();

         // The input field must be empty
         const inputEmailUser = screen.getByTestId("employee-email-input");
         expect(inputEmailUser.value).toBe("");

         // The input field must be empty
         const inputPasswordUser = screen.getByTestId(
            "employee-password-input"
         );
         expect(inputPasswordUser.value).toBe("");

         const form = screen.getByTestId("form-employee");
         const handleSubmit = jest.fn((e) => e.preventDefault());
         form.addEventListener("submit", handleSubmit);
         fireEvent.submit(form);

         // The form must be present on the page and its value return "true"
         expect(screen.getByTestId("form-employee")).toBeTruthy();
      });
   });

   describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
      // #02
      test("Then It should renders Login page", () => {
         document.body.innerHTML = LoginUI();

         // We enter an incorrect format
         const inputEmailUser = screen.getByTestId("employee-email-input");
         fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
         expect(inputEmailUser.value).toBe("pasunemail");

         // We enter an incorrect format
         const inputPasswordUser = screen.getByTestId(
            "employee-password-input"
         );
         fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
         expect(inputPasswordUser.value).toBe("azerty");

         const form = screen.getByTestId("form-employee");
         const handleSubmit = jest.fn((e) => e.preventDefault());
         form.addEventListener("submit", handleSubmit);
         fireEvent.submit(form);

         // The form must be present on the page and its value return "true"
         expect(screen.getByTestId("form-employee")).toBeTruthy();
      });
   });

   describe("When I do fill fields in correct format and I click on employee button Login In", () => {
      // #03
      test("Then I should be identified as an Employee in app", () => {
         document.body.innerHTML = LoginUI();
         const inputData = {
            email: "johndoe@email.com",
            password: "azerty",
         };

         const inputEmailUser = screen.getByTestId("employee-email-input");
         fireEvent.change(inputEmailUser, {
            target: { value: inputData.email },
         });

         // The value of the "email" field must return the value "johndoe@email.com"
         expect(inputEmailUser.value).toBe(inputData.email);

         const inputPasswordUser = screen.getByTestId(
            "employee-password-input"
         );
         fireEvent.change(inputPasswordUser, {
            target: { value: inputData.password },
         });

         // The value of the "password" field must return the value "azerty"
         expect(inputPasswordUser.value).toBe(inputData.password);

         const form = screen.getByTestId("form-employee");

         // localStorage should be populated with form data
         Object.defineProperty(window, "localStorage", {
            value: {
               getItem: jest.fn(() => null),
               setItem: jest.fn(() => null),
            },
            writable: true,
         });

         // we have to mock navigation to test it
         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         };

         let PREVIOUS_LOCATION = "";

         const store = jest.fn();

         const login = new Login({
            document,
            localStorage: window.localStorage,
            onNavigate,
            PREVIOUS_LOCATION,
            store,
         });

         const handleSubmit = jest.fn(login.handleSubmitEmployee);
         login.login = jest.fn().mockResolvedValue({});
         form.addEventListener("submit", handleSubmit);
         fireEvent.submit(form);

         // By clicking on the connection button, the function that manages the connection must be called
         expect(handleSubmit).toHaveBeenCalled();

         // The method that changes the url must be called with the arguments below
         expect(window.localStorage.setItem).toHaveBeenCalled();
         expect(window.localStorage.setItem).toHaveBeenCalledWith(
            "user",
            JSON.stringify({
               type: "Employee",
               email: inputData.email,
               password: inputData.password,
               status: "connected",
            })
         );
      });

      // #04
      test("It should renders Bills page", () => {
         // The rendered page should display the title "Mes notes de frais"
         expect(screen.queryByText("Mes notes de frais")).toBeDefined();
      });
   });
});

describe("Given that I am a user on login page", () => {
   describe("When I do not fill fields and I click on admin button Login In", () => {
      test("Then It should renders Login page", () => {
         document.body.innerHTML = LoginUI();

         const inputEmailUser = screen.getByTestId("admin-email-input");
         expect(inputEmailUser.value).toBe("");

         const inputPasswordUser = screen.getByTestId("admin-password-input");
         expect(inputPasswordUser.value).toBe("");

         const form = screen.getByTestId("form-admin");
         const handleSubmit = jest.fn((e) => e.preventDefault());

         form.addEventListener("submit", handleSubmit);
         fireEvent.submit(form);
         expect(screen.getByTestId("form-admin")).toBeTruthy();
      });
   });

   describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
      test("Then it should renders Login page", () => {
         document.body.innerHTML = LoginUI();

         const inputEmailUser = screen.getByTestId("admin-email-input");
         fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
         expect(inputEmailUser.value).toBe("pasunemail");

         const inputPasswordUser = screen.getByTestId("admin-password-input");
         fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
         expect(inputPasswordUser.value).toBe("azerty");

         const form = screen.getByTestId("form-admin");
         const handleSubmit = jest.fn((e) => e.preventDefault());

         form.addEventListener("submit", handleSubmit);
         fireEvent.submit(form);
         expect(screen.getByTestId("form-admin")).toBeTruthy();
      });
   });

   describe("When I do fill fields in correct format and I click on admin button Login In", () => {
      test("Then I should be identified as an HR admin in app", () => {
         document.body.innerHTML = LoginUI();
         const inputData = {
            type: "Admin",
            email: "johndoe@email.com",
            password: "azerty",
            status: "connected",
         };

         const inputEmailUser = screen.getByTestId("admin-email-input");
         fireEvent.change(inputEmailUser, {
            target: { value: inputData.email },
         });
         expect(inputEmailUser.value).toBe(inputData.email);

         const inputPasswordUser = screen.getByTestId("admin-password-input");
         fireEvent.change(inputPasswordUser, {
            target: { value: inputData.password },
         });
         expect(inputPasswordUser.value).toBe(inputData.password);

         const form = screen.getByTestId("form-admin");

         // localStorage should be populated with form data
         Object.defineProperty(window, "localStorage", {
            value: {
               getItem: jest.fn(() => null),
               setItem: jest.fn(() => null),
            },
            writable: true,
         });

         // we have to mock navigation to test it
         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         };

         let PREVIOUS_LOCATION = "";

         const store = jest.fn();

         const login = new Login({
            document,
            localStorage: window.localStorage,
            onNavigate,
            PREVIOUS_LOCATION,
            store,
         });

         const handleSubmit = jest.fn(login.handleSubmitAdmin);
         login.login = jest.fn().mockResolvedValue({});
         form.addEventListener("submit", handleSubmit);
         fireEvent.submit(form);
         expect(handleSubmit).toHaveBeenCalled();
         expect(window.localStorage.setItem).toHaveBeenCalled();
         expect(window.localStorage.setItem).toHaveBeenCalledWith(
            "user",
            JSON.stringify({
               type: "Admin",
               email: inputData.email,
               password: inputData.password,
               status: "connected",
            })
         );
      });

      test("It should renders HR dashboard page", () => {
         expect(screen.queryByText("Validations")).toBeTruthy();
      });
   });
});
