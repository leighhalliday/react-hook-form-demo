import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ReCAPTCHA from "react-google-recaptcha";

interface FormData {
  name: string;
  email: string;
  password: string;
  terms: boolean;
}

export default function Home() {
  const { register, handleSubmit, errors } = useForm<FormData>({
    defaultValues: {
      name: "Leigh",
      email: "email@email.com",
      password: "P@ssw0rd!",
      terms: true,
    },
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<Array<string>>([]);
  const reRef = useRef<ReCAPTCHA>();

  return (
    <form
      onSubmit={handleSubmit(async (formData) => {
        setSubmitting(true);
        setServerErrors([]);

        const token = await reRef.current.executeAsync();
        reRef.current.reset();

        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            terms: formData.terms,
            token,
          }),
        });
        const data = await response.json();

        if (data.errors) {
          setServerErrors(data.errors);
        } else {
          console.log("success, redirect to home page");
        }

        setSubmitting(false);
      })}
    >
      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        size="invisible"
        ref={reRef}
      />

      {serverErrors && (
        <ul>
          {serverErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          ref={register({ required: "required" })}
        />
        {errors.name ? <div>{errors.name.message}</div> : null}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          ref={register({ required: "required" })}
        />
        {errors.email ? <div>{errors.email.message}</div> : null}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          ref={register({
            required: "required",
            minLength: {
              value: 8,
              message: "must be 8 chars",
            },
            validate: (value) => {
              return (
                [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].every((pattern) =>
                  pattern.test(value)
                ) || "must include lower, upper, number, and special chars"
              );
            },
          })}
        />
        {errors.password ? <div>{errors.password.message}</div> : null}
      </div>

      <div>
        <label htmlFor="terms">You must agree to our terms.</label>
        <input
          type="checkbox"
          name="terms"
          id="terms"
          ref={register({ required: "you must agree to terms" })}
        />
        {errors.terms ? <div>{errors.terms.message}</div> : null}
      </div>

      <div>
        <button type="submit" disabled={submitting}>
          Register
        </button>
      </div>
    </form>
  );
}
