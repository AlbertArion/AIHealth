const promptImgCondition =
	"这是我本人的一份报告，请提取诊断信息；然后总结身体存在的问题、原因、解决方法；接下来该怎么做？请用通俗易懂的语言描述，遇到专业名词请简单解释。如果属于正常范围内，不要建议做额外检测。";
const promptImgEcg = "这是我本人的一份心电报告，提取心率指标，如有异常的心电图结论请指出，并用通俗的语言告诉我，我的健康状况如何？如何保持健康？";
const promptPdfCondition = "如果有诊断结论，请帮我提取；然后告诉我身体存在的问题、原因、解决方法？我接下来该怎么做？如果属于正常范围内，不要建议我做额外检测。";
const promptInquiry = "请帮我汇总诊断结论；然后告诉我身体存在的问题、原因、解决方法？如果属于正常范围内，不要建议我做额外检测，否则告诉我一个推荐的医院，以及可能要吃的药。";

export {
	promptImgCondition,
	promptImgEcg,
	promptPdfCondition,
	promptInquiry
}