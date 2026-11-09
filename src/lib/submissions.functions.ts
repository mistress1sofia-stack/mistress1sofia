import { createServerFn } from '@tanstack/react-start';
import { submissionSchema } from './submission-validation';

export const submitRequest = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => submissionSchema.parse(input))
  .handler(async ({ data }) => {
    const { persistAndNotify } = await import('./submissions.server');
    return persistAndNotify(data);
  });