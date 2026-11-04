import React, { useState, useEffect } from 'react';
import { Form, Formik, Field } from 'formik';
import * as Yup from 'yup';

interface ProductFormProps {
  initialProduct?: any;
  onSubmit: (values: any) => void;
  isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialProduct, onSubmit, isEditing }) => {
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    description: Yup.string(),
    // distributor_id: Yup.number().required('Distributor ID is required'), // Assuming distributor ID is handled elsewhere
  });

  const initialValues = {
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    // distributor_id: initialProduct?.distributor_id || 1, // Default distributor ID
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        onSubmit(values);
        setSubmitting(false);
      }}
      enableReinitialize // crucial for editing existing products
    >
      {({ isSubmitting }) => (
        <Form>
          <div>
            <label htmlFor="name">Name:</label>
            <Field type="text" id="name" name="name" />
            <div style={{ color: 'red' }}>{/* Error message will appear here */}</div>
          </div>

          <div>
            <label htmlFor="description">Description:</label>
            <Field as="textarea" id="description" name="description" />
            <div style={{ color: 'red' }}>{/* Error message will appear here */}</div>
          </div>

          {/* <div>
            <label htmlFor="distributor_id">Distributor ID:</label>
            <Field type="number" id="distributor_id" name="distributor_id" />
            <div style={{ color: 'red' }}>{/* Error message will appear here */}</div>
          </div> */}

          <button type="submit" disabled={isSubmitting}>
            {isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ProductForm;