declare class ULine extends String {
  is_uline:boolean;
  toString():string;
}

declare let html: (template: TemplateStringsArray, ...values: any ) => ULine;
declare let svg: (template: TemplateStringsArray, ...values: any ) => ULine;
declare let raw: (template: TemplateStringsArray, ...values: any ) => ULine;
declare let css: (template: TemplateStringsArray, ...values: any ) => ULine;
