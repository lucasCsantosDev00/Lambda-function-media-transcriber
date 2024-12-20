FROM public.ecr.aws/lambda/nodejs:20 AS builder
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .  
RUN npm run build

FROM public.ecr.aws/lambda/nodejs:20
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/dist/* ./
COPY --from=builder /usr/app/node_modules ./node_modules
CMD ["index.handler"]
