// Allow webpack to import svg assets
declare module '*.svg' {
  const content: string;
  export default content;
}
