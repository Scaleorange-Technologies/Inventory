import React, { useState } from "react";
import { User, Mail, Phone, Lock, Save, Plus, CheckCircle } from "lucide-react";

export default function ManageCustomersForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
    
  //   // Simulate API call
  //   await new Promise(resolve => setTimeout(resolve, 1500));
    
  //   setIsSubmitting(false);
  //   setIsSuccess(true);
    
  //   // Reset after showing success
  //   setTimeout(() => {
  //     setIsSuccess(false);
  //     setFormData({ name: "", email: "", phone: "", password: "" });
  //   }, 2000);
  // };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const accessToken = localStorage.getItem("accesstoken");
  
      const response = await fetch("http://localhost:4000/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setIsSuccess(true);
        setFormData({ name: "", email: "", phone: "", password: "" });
  
        setTimeout(() => {
          setIsSuccess(false);
        }, 2000);
      } else {
        console.log(data.message || "Something went wrong");
      }
    } catch (error) {
      alert("Network error or server unavailable");
    }
  
    setIsSubmitting(false);
  };
  
  const inputFields = [
    { name: "name", type: "text", label: "Full Name", icon: User, placeholder: "Enter customer's full name" },
    { name: "email", type: "email", label: "Email Address", icon: Mail, placeholder: "customer@company.com" },
    { name: "phone", type: "tel", label: "Phone Number", icon: Phone, placeholder: "+1 (555) 123-4567" },
    { name: "password", type: showPassword ? "text" : "password", label: "Password", icon: Lock, placeholder: "Create secure password", hasToggle: true },
  ];

  if (isSuccess) {
    return (
      <div className="w-full">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Customer Added Successfully!</h3>
            <p className="text-gray-600 text-sm">The new customer has been added to your system.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            Add New Customer
          </h3>
          <p className="text-gray-600 text-sm">Create a new customer profile in your system</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {inputFields.map((field) => {
            const Icon = field.icon;
            const isFocused = focusedField === field.name;
            const hasValue = formData[field.name].length > 0;
            
            return (
              <div key={field.name} className="relative group">
                <label className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
                  isFocused ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {field.label}
                </label>
                
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
                    isFocused ? 'text-blue-600 scale-110' : 'text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => setFocusedField("")}
                    placeholder={field.placeholder}
                    required
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 ${
                      isFocused 
                        ? 'bg-white border-blue-500' 
                        : hasValue 
                          ? 'bg-white border-gray-400' 
                          : 'hover:border-gray-400'
                    }`}
                  />
                    
                    {field.hasToggle && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showPassword ? (
                          // Eye open icon (visible)
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          // Eye closed icon (hidden)
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.965 9.965 0 012.014-3.407m1.48-1.57A9.965 9.965 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.963 9.963 0 01-4.194 5.031M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed ${
            isSubmitting ? 'animate-pulse' : ''
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Adding Customer...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Customer</span>
              </>
            )}
          </div>
        </button>

        {/* Progress indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Form Completion</span>
            <span>{Math.round((Object.values(formData).filter(v => v.length > 0).length / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="h-1 bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(Object.values(formData).filter(v => v.length > 0).length / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}