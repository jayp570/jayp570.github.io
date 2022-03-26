let functions = [
    {formula: "\\frac{a}{b}", keywords: ["fraction", "divide"]},
    {formula: "\\int_{a}^{b}", keywords: ["integral"]},
    {formula: "\\sum_{n=1}^{\\infty}", keywords: ["summation", "sigma notation", "series"]},
    {formula: "\\prod_{i=a}^{b}", keywords: ["product", "pi notation"]},
    {formula: "\\lim_{x\\to\\infty}", keywords: ["limit"]},
    {formula: "a^{n}", keywords: ["superscript, power", "exponent"]},
    {formula: "a_{n}", keywords: ["subscript"]},
    {formula: "\\sqrt[n]{a}", keywords: ["square root", "radical"]},
    {formula: "\\sin(x)", keywords: ["sine"]},
    {formula: "\\cos(x)", keywords: ["cosine"]},
    {formula: "\\tan(x)", keywords: ["tangent"]},
    {formula: "\\cot(x)", keywords: ["cotangent"]},
    {formula: "\\sec(x)", keywords: ["secant"]},
    {formula: "\\csc(x)", keywords: ["cosecant"]},
    {formula: "\\pm", keywords: ["plus or minus"]},
    {formula: "\\log_b{x}", keywords: ["logarithm"]},
    {formula: "\\ln{x}", keywords: ["natural logarithm", "ln"]},
    {formula: "\\dots", keywords: ["ellipses", "dot dot dot"]},
    {formula: "\\binom{a}{b}", keywords: ["binomial coefficient"]},
]

//load url params
if(window.location.search == "") {
    document.getElementById("editor").value = "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"
} else {
    let urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.get("text"))
    document.getElementById("editor").value = urlParams.get("text")
}



document.getElementById("editor").addEventListener('input', function(evt) { 
    let input = document.getElementById("editor").value
    let html = katex.renderToString(input, {
        throwOnError: false,
        displayMode: true
    })
    document.getElementById("output").innerHTML = html
});

document.getElementById("searchInput").addEventListener('input', function(evt) {
    let input = document.getElementById("searchInput").value
    input = input.toLowerCase()
    if(input.trim() != "") {
        let results = []
        for(let i = 0; i < functions.length; i++) {
            let func = functions[i]
            let keywords = func.keywords
            for(let keyword of keywords) {
                if(keyword.includes(input)) {
                    results.push({
                        katex: func.formula,
                        html: func.html
                    })
                    break
                }
            }
        }
        document.getElementById("searchOutput").innerHTML = ""
        for(let result of results) {
            document.getElementById("searchOutput").innerHTML += `
            <div id="result">
                <span style="font-family: 'Courier New', Courier, monospace;">${result.katex}</span>
                <div style="float: right;">${result.html}</div>
            </div>
            `
        }
    } else {
        document.getElementById("searchOutput").innerHTML = ""
    }
});



function copyLink() {
    let url = window.location.href
    let editorText = encodeURIComponent(document.getElementById("editor").value)
    if(url.indexOf("?") == -1) {
        navigator.clipboard.writeText(url+"?text="+editorText);
    } else {
        navigator.clipboard.writeText(url.substring(0, url.indexOf("?"))+"?text="+editorText);
    }
    //do cool copied animation
    document.getElementById("copiedDisplay").style.opacity = 1
    for(let i = 0; i < 1/0.01; i++) {
        setTimeout(() => {
            document.getElementById("copiedDisplay").style.opacity -= 0.01;
        }, i*10)
    }
}



setTimeout(() => {
    //render for first time
    let input = document.getElementById("editor").value
    let html = katex.renderToString(input, {
        throwOnError: false,
        displayMode: true
    })
    document.getElementById("output").innerHTML = html

    //make functions katex html
    for(let i = 0; i < functions.length; i++) {
        let func = functions[i]
        functions[i] = {
            formula: func.formula,
            keywords: func.keywords,
            html: katex.renderToString(func.formula, {
                throwOnError: false
            })
        }
    }
    console.log(functions)
}, 100)
